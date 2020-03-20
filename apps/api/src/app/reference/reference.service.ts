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
    filter: boolean,
    senseId?: string
  ): Promise<SenseForEntryDto[]> {
    const match = { oxId: oxId };
    if (senseId) {
      match['senseId'] = senseId;
    }

    const basePipeline = [
      { $match: match },
      {
        $lookup: {
          from: `${SENSE_COLLECTION_NAME.toLowerCase()}s`,
          localField: 'senseId',
          foreignField: 'senseId',
          as: 'senses'
        }
      },
      {
        $unwind: '$senses'
      },
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

    const filterForHasSignsPipeline = [
      {
        $lookup: {
          from: `${SENSE_SIGN_COLLECTION_NAME.toLowerCase()}s`,
          localField: 'senseId',
          foreignField: 'senseId',
          as: 'senseSigns'
        }
      },
      {
        $project: {
          _id: 0,
          senseSigns: 0
        }
      }
    ];

    if (filter) {
      // @ts-ignore
      basePipeline.push(...filterForHasSignsPipeline);
    }

    return this.entrySenseModel
      .aggregate(basePipeline)
      .collation(CASE_INSENSITIVE_COLLATION);
  }

  getSenseSigns(senseId: string): Promise<SenseSignRecord[]> {
    return this.senseSignModel
      .find({ senseId: senseId })
      .lean()
      .exec();
  }

  async getSigns(senseId: string): Promise<SignRecord[]> {
    return this.senseSignModel.aggregate([
      { $match: { senseId: senseId } },
      {
        $lookup: {
          from: `${SIGN_COLLECTION_NAME.toLowerCase()}s`,
          localField: 'signId',
          foreignField: '_id',
          as: 'signs'
        }
      },
      {
        $unwind: '$signs'
      },
      {
        $project: {
          _id: '$signs._id',
          mnemonic: '$signs.mnemonic',
          mediaUrl: '$signs.mediaUrl',
          s3Key: '$signs.s3Key'
        }
      }
    ]);
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
