import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SIGN_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import { SignDocument } from './interfaces/sign.interface';
import {
  SenseSignDocument,
  SenseSignRecord
} from './interfaces/sense-sign.interface';
import { ObjectId } from 'bson';
import { SignRecord } from '@edfu/api-interfaces';

@Injectable()
export class SignsService {
  constructor(
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  getSenseSigns(senseId: string): Promise<SenseSignRecord[]> {
    return this.senseSignModel
      .find({ senseId: senseId })
      .lean()
      .exec();
  }

  findOneSign(_id: ObjectId): Promise<SignRecord> {
    //   return null
    return this.signModel
      .findById(_id)
      .lean()
      .exec();
  }
}
