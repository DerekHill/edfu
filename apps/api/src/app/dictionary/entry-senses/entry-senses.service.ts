import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ENTRY_SENSE_COLLECTION_NAME } from '../../constants';
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

  findOrCreate(
    oxId: string,
    homographC: number,
    senseId: string,
    associationType: DictionaryOrThesaurus,
    similarity: number
  ): Promise<EntrySenseRecord> {
    return this.entrySenseModel
      .findOneAndUpdate(
        { oxId: oxId, homographC: homographC, senseId: senseId },
        {
          oxId: oxId,
          homographC: homographC,
          senseId: senseId,
          associationType: associationType,
          similarity: similarity
        },
        {
          upsert: true,
          new: true
        }
      )
      .lean()
      .exec();
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
