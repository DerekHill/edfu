import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  SenseSignDocument,
  SenseSignRecord
} from './interfaces/sense-sign.interface';
import { SignDocument } from './interfaces/sign.interface';
import { SignRecord, SenseSignRecordWithoutId } from '@edfu/api-interfaces';
import { ObjectId } from 'bson';

@Injectable()
export class SignTestSetupService {
  constructor(
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  createSenseSign(params: any): Promise<SenseSignRecord> {
    const defaults = {
      userId: new ObjectId(),
      senseId: new ObjectId(),
      signId: new ObjectId()
    };
    return this.senseSignModel.create({ ...defaults, ...params });
  }

  createSign(params: any): Promise<SignRecord> {
    const defaults = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'remember me',
      s3KeyOrig: '1234.mp4'
    };
    return this.signModel.create({ ...defaults, ...params });
  }
}
