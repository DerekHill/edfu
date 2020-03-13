import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SIGN_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../../constants';
import { Model } from 'mongoose';
import { SignDocument } from './interfaces/sign.interface';
import {
  SenseSignDocument,
  SenseSignRecord
} from './interfaces/sense-sign.interface';
import { ObjectId } from 'bson';
import {
  SignRecord,
  SignRecordWithoutId,
  SenseSignRecordWithoutId
} from '@edfu/api-interfaces';

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
    return this.signModel
      .findById(_id)
      .lean()
      .exec();
  }

  async createSignWithAssociations(
    signRecord: SignRecordWithoutId,
    senseIds: string[]
  ): Promise<any> {
    const sign = await this.signModel.create(signRecord);

    const promises = [];

    for (const senseId of senseIds) {
      promises.push(
        this.findOrCreateSenseSign({
          userId: sign.userId,
          senseId: senseId,
          signId: sign._id
        })
      );
    }

    await Promise.all(promises);

    return sign;
  }

  private async findOrCreateSenseSign(
    senseSign: SenseSignRecordWithoutId
  ): Promise<SenseSignRecord> {
    try {
      return await this.senseSignModel
        .findOneAndUpdate(senseSign, senseSign, {
          upsert: true,
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
        return this.senseSignModel
          .findOne(senseSign)
          .lean()
          .exec();
      } else {
        throw error;
      }
    }
  }
}
