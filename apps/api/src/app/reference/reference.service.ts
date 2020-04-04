import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  CASE_INSENSITIVE_COLLATION,
  ENTRY_SENSE_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../constants';
import { EntryDocument } from './entries/interfaces/entry.interface';
import { Model } from 'mongoose';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { EntrySenseDocument } from './entry-senses/interfaces/entry-sense.interface';
import { SenseDocument } from './senses/interfaces/sense.interface';
import {
  SenseSignRecord,
  SenseSignDocument
} from './signs/interfaces/sense-sign.interface';
import { SignRecord } from '@edfu/api-interfaces';
import { SignDocument } from './signs/interfaces/sign.interface';
import { ObjectId } from 'bson';
import * as pluralize from 'mongoose-legacy-pluralize';
import { DictionaryOrThesaurus } from '@edfu/enums';

const OXIDS_LIMIT = 100;
const SITEMAP_URL_LIMIT = 50_000;

interface SensesForOxIdCaseInsensitiveParams {
  oxId: string;
  senseId?: string;
  filterForHasSign?: boolean;
  filterForDictionarySenses?: boolean;
}

const ENTRY_SENSES_INNER_JOIN = [
  {
    $lookup: {
      from: `${pluralize(ENTRY_SENSE_COLLECTION_NAME)}`,
      localField: 'oxId',
      foreignField: 'oxId',
      as: 'entrySenses'
    }
  },
  {
    $unwind: '$entrySenses'
  }
];

const SENSES_INNER_JOIN = [
  {
    $lookup: {
      from: `${pluralize(SENSE_COLLECTION_NAME)}`,
      localField: 'senseId',
      foreignField: 'senseId',
      as: 'senses'
    }
  },
  {
    $unwind: '$senses'
  }
];

const senseSignInnerJoin = (localField: string) => {
  return [
    {
      $lookup: {
        from: `${pluralize(SENSE_SIGN_COLLECTION_NAME)}`,
        localField: localField,
        foreignField: 'senseId',
        as: 'senseSigns'
      }
    },
    {
      $unwind: '$senseSigns'
    }
  ];
};

const SIGNS_INNER_JOIN = [
  {
    $lookup: {
      from: `${pluralize(SIGN_COLLECTION_NAME)}`,
      localField: 'signId',
      foreignField: '_id',
      as: 'signs'
    }
  },
  {
    $unwind: '$signs'
  }
];

@Injectable()
export class ReferenceService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    @InjectModel(ENTRY_SENSE_COLLECTION_NAME)
    private readonly entrySenseModel: Model<EntrySenseDocument>,
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>,
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  searchOxIds(chars: string, filter: boolean): Promise<string[]> {
    const sanitizedChars = this._removeInvalidRegexChars(chars);

    if (!sanitizedChars) {
      return Promise.resolve([]);
    }

    if (filter) {
      return this.searchOxIdsWithSigns(chars);
    } else {
      return this.searchOxIdsAll(chars);
    }
  }

  sensesForOxIdCaseInsensitive({
    oxId,
    senseId = null,
    filterForHasSign = true,
    filterForDictionarySenses = false
  }: SensesForOxIdCaseInsensitiveParams): Promise<SenseForEntryDto[]> {
    const query = { oxId: oxId };

    if (senseId) {
      query['senseId'] = senseId;
    }

    if (filterForDictionarySenses) {
      query['associationType'] = DictionaryOrThesaurus.dictionary;
    }

    const match = [{ $match: query }];

    const projectWithExampleOrDefinition = [
      {
        $project: {
          oxId: 1,
          ownEntryOxId: '$senses.ownEntryOxId',
          ownEntryHomographC: '$senses.ownEntryHomographC',
          homographC: 1,
          senseId: '$senses.senseId',
          lexicalCategory: '$senses.lexicalCategory',
          apiSenseIndex: '$senses.apiSenseIndex',
          example: '$senses.example',
          definition: '$senses.definition',
          associationType: 1,
          similarity: 1
        }
      },
      {
        $match: {
          $or: [{ example: { $ne: null } }, { definition: { $ne: null } }]
        }
      }
    ];

    const pipeline = [
      ...match,
      ...SENSES_INNER_JOIN,
      ...projectWithExampleOrDefinition
    ];

    const dropUneededFields = [
      {
        $project: {
          _id: 0,
          senseSigns: 0
        }
      }
    ];

    const filterForHasSignsPipeline = [
      ...senseSignInnerJoin('senseId'),
      ...dropUneededFields
    ];

    if (filterForHasSign) {
      // @ts-ignore
      pipeline.push(...filterForHasSignsPipeline);
    }

    return this.entrySenseModel
      .aggregate(pipeline)
      .collation(CASE_INSENSITIVE_COLLATION)
      .exec();
  }

  getSenseSigns(senseId: string): Promise<SenseSignRecord[]> {
    return this.senseSignModel
      .find({ senseId: senseId })
      .lean()
      .exec();
  }

  getSigns(senseId: string): Promise<SignRecord[]> {
    const match = [{ $match: { senseId: senseId } }];

    const project = [
      {
        $project: {
          _id: '$signs._id',
          mnemonic: '$signs.mnemonic',
          s3KeyOrig: '$signs.s3KeyOrig'
        }
      }
    ];

    const pipeline = [...match, ...SIGNS_INNER_JOIN, ...project];

    return this.senseSignModel.aggregate(pipeline).exec();
  }

  findOneSign(_id: ObjectId): Promise<SignRecord> {
    return this.signModel
      .findById(_id)
      .lean()
      .exec();
  }

  async allOxIdsLowercaseThatHaveDictionarySensesAndSigns(): Promise<string[]> {
    const match = [
      { $match: { dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary } }
    ];
    const projectAndGroup = [
      {
        $project: {
          oxId: { $toLower: '$ownEntryOxId' }
        }
      },
      { $group: { _id: '$oxId' } }
    ];
    const pipeline = [
      ...match,
      ...senseSignInnerJoin('senseId'),
      ...projectAndGroup,
      ...[{ $limit: SITEMAP_URL_LIMIT }]
    ];

    const objs = await this.senseModel.aggregate(pipeline);
    return objs.map(i => i._id);
  }

  _removeInvalidRegexChars(chars: string): string {
    return chars.replace('\\', '');
  }

  private async searchOxIdsAll(chars: string): Promise<string[]> {
    const objs = await this.entryModel
      .find({ word: { $regex: `^${chars}`, $options: '$i' } }, { oxId: 1 })
      .limit(OXIDS_LIMIT)
      .exec();
    const ids = objs.map(i => i.oxId);
    return [...new Set(ids)];
  }

  private async searchOxIdsWithSigns(chars: string): Promise<string[]> {
    const match = [
      {
        $match: { word: { $regex: `^${chars}`, $options: '$i' } }
      }
    ];
    const groupAndLimit = [
      { $group: { _id: '$oxId' } },
      { $limit: OXIDS_LIMIT }
    ];
    const pipeline = [
      ...match,
      ...ENTRY_SENSES_INNER_JOIN,
      ...senseSignInnerJoin('entrySenses.senseId'),
      ...groupAndLimit
    ];

    const objs = await this.entryModel.aggregate(pipeline);
    return objs.map(i => i._id);
  }
}
