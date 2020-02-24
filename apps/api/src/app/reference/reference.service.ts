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
import {
  EntrySenseRecord,
  EntrySenseDocument
} from './entry-senses/interfaces/entry-sense.interface';
import { SenseDocument } from './senses/interfaces/sense.interface';
import {
  SenseSignRecord,
  SenseSignDocument
} from './signs/interfaces/sense-sign.interface';
import { SignRecord } from '@edfu/api-interfaces';
import { SignDocument } from './signs/interfaces/sign.interface';
import { ObjectId } from 'bson';

const OXIDS_LIMIT = 100;

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

  async searchOxIds(chars: string, filter: boolean): Promise<string[]> {
    const sanitizedChars = this._removeInvalidRegexChars(chars);

    if (!sanitizedChars) {
      return Promise.resolve([]);
    }

    if (filter) {
      return this.searchOxIdsAndFilterForSigns(chars);
    } else {
      return this.searchOxIdsWithoutFilteringForSigns(chars);
    }
  }

  async getSensesForOxIdCaseInsensitive(
    oxId: string,
    filter: boolean
  ): Promise<SenseForEntryDto[]> {
    const entrySenses = await this.findByOxIdCaseInsensitive(oxId);
    return this.getValidSenses(entrySenses, filter);
  }

  getSenseSigns(senseId: string): Promise<SenseSignRecord[]> {
    return this.senseSignModel
      .find({ senseId: senseId })
      .lean()
      .exec();
  }

  findOneSign(_id: ObjectId): Promise<SignRecord> {
    return this.signModel
      .findById(_id)
      .lean()
      .exec();
  }

  _removeInvalidRegexChars(chars: string): string {
    return chars.replace('\\', '');
  }

  private async getValidSenses(
    entrySenses: EntrySenseRecord[],
    filter: boolean
  ): Promise<SenseForEntryDto[]> {
    const entrySensesById = entrySenses.reduce((acc, curr) => {
      acc[curr.senseId] = curr;
      return acc;
    }, {});

    let senseIds = entrySenses.map(i => i.senseId);

    if (filter) {
      const senseSigns = await this.senseSignModel.find({
        senseId: { $in: senseIds }
      });
      senseIds = [...new Set(senseSigns.map(i => i.senseId))];
    }

    const senses = await this.senseModel.find({
      senseId: { $in: senseIds },
      definition: { $ne: null }
    });

    return senses.map(sense => {
      const entrySense = entrySensesById[sense.senseId];
      return {
        oxId: entrySense.oxId,
        ownEntryOxId: sense.ownEntryOxId,
        ownEntryHomographC: sense.ownEntryHomographC,
        homographC: entrySense.homographC,
        senseId: sense.senseId,
        lexicalCategory: sense.lexicalCategory,
        apiSenseIndex: sense.apiSenseIndex,
        example: sense.example,
        definition: sense.definition,
        associationType: entrySense.associationType,
        similarity: entrySense.similarity
      };
    });
  }

  private findByOxIdCaseInsensitive(oxId: string): Promise<EntrySenseRecord[]> {
    return this.entrySenseModel
      .find({ oxId: oxId })
      .collation(CASE_INSENSITIVE_COLLATION)
      .lean()
      .exec();
  }

  private async searchOxIdsWithoutFilteringForSigns(
    chars: string
  ): Promise<string[]> {
    const objs = await this.entryModel
      .find({ word: { $regex: `^${chars}`, $options: '$i' } }, { oxId: 1 })
      .limit(OXIDS_LIMIT)
      .exec();
    const ids = objs.map(i => i.oxId);
    return [...new Set(ids)];
  }

  private async searchOxIdsAndFilterForSigns(chars: string): Promise<string[]> {
    const objs = await this.entryModel.aggregate([
      {
        $match: { word: { $regex: `^${chars}`, $options: '$i' } }
      },
      {
        $lookup: {
          from: `${ENTRY_SENSE_COLLECTION_NAME.toLowerCase()}s`,
          localField: 'oxId',
          foreignField: 'oxId',
          as: 'entrySenses'
        }
      },
      {
        $unwind: '$entrySenses'
      },
      {
        $lookup: {
          from: `${SENSE_SIGN_COLLECTION_NAME.toLowerCase()}s`,
          localField: 'entrySenses.senseId',
          foreignField: 'senseId',
          as: 'senseSigns'
        }
      },
      {
        $unwind: '$senseSigns'
      },
      { $group: { _id: '$oxId' } },
      { $limit: OXIDS_LIMIT }
    ]);
    return objs.map(i => i._id);
  }
}
