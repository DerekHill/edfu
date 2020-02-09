import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_SENSE_COLLECTION_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../../constants';
import { Model } from 'mongoose';
import {
  EntrySenseDocument,
  EntrySenseRecord
} from './interfaces/entry-sense.interface';
import { DictionaryOrThesaurus } from '@edfu/enums';

@Injectable()
export class EntrySensesService {
  constructor(
    @InjectModel(ENTRY_SENSE_COLLECTION_NAME)
    private readonly entrySenseModel: Model<EntrySenseDocument>
  ) {}

  async findOrCreate(
    oxId: string,
    homographC: number,
    senseId: string,
    associationType: DictionaryOrThesaurus,
    similarity: number
  ): Promise<EntrySenseRecord> {
    const conditions = {
      oxId: oxId,
      homographC: homographC,
      senseId: senseId
    };

    const allParams = {
      ...conditions,
      ...{ associationType: associationType, similarity: similarity }
    };

    try {
      return await this.entrySenseModel
        .findOneAndUpdate(conditions, allParams, {
          upsert: true,
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
        return this.entrySenseModel
          .findOne(conditions)
          .lean()
          .exec();
      } else {
        throw error;
      }
    }
  }

  findByEntryProperties(
    oxId: string,
    homographC: number
  ): Promise<EntrySenseRecord[]> {
    return this.entrySenseModel
      .find({ oxId: oxId, homographC: homographC })
      .lean()
      .exec();
  }
}
