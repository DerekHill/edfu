import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SIGN_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../../constants';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import {
  SignRecord,
  SenseSignParams,
  SenseSignDocument,
  SenseSignRecord,
  SignDocument
} from '@edfu/api-interfaces';
import { CreateSignDto } from './dto/create-sign.dto';

@Injectable()
export class SignsService {
  constructor(
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  findOneSign(_id: ObjectId): Promise<SignRecord> {
    return this.signModel
      .findById(_id)
      .lean()
      .exec();
  }

  async createSignWithAssociations(
    userId: ObjectId,
    createSignInput: CreateSignDto
  ): Promise<any> {
    const sign = await this.signModel.create({
      ...createSignInput,
      ...{ userId: userId }
    });

    const promises = [];

    for (const senseId of createSignInput.senseIds) {
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

  findSignByIdAndUpdate(_id: ObjectId, update: any) {
    return this.signModel.findByIdAndUpdate(_id, update);
  }

  private async findOrCreateSenseSign(
    senseSign: SenseSignParams
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
