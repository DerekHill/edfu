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

@Injectable()
export class SignTestSetupService {
  constructor(
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  createSenseSign(
    senseSign: SenseSignRecordWithoutId
  ): Promise<SenseSignRecord> {
    return this.senseSignModel.create(senseSign);
  }

  createSign(sign: SignRecord): Promise<SignRecord> {
    return this.signModel.create(sign);
  }
}