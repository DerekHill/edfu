import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ENTRY_SENSE_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { EntrySenseDocument } from './interfaces/entry-sense.interface';

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
    confidence: number
  ) {
    return this.entrySenseModel
      .findOneAndUpdate(
        { oxId: oxId, homographC: homographC, senseId: senseId },
        {
          oxId: oxId,
          homographC: homographC,
          senseId: senseId,
          confidence: confidence
        },
        {
          upsert: true,
          new: true
        }
      )
      .lean()
      .exec();
  }
}
