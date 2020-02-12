import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  SenseSignDocument,
  SenseSignRecordWithoutId,
  SenseSignRecord
} from './interfaces/sense-sign.interface';
import { SignDocument, SignRecord } from './interfaces/sign.interface';

@Injectable()
export class SignsTestSetupService {
  constructor(
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  createSign(sign: SignRecord): Promise<SignRecord> {
    return this.signModel.create(sign);
  }

  createSenseSign(
    senseSign: SenseSignRecordWithoutId
  ): Promise<SenseSignRecord> {
    return this.senseSignModel.create(senseSign);
  }
}
