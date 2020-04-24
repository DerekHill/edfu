import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LIKE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  ManageLikeParams,
  FindLikeParams,
  LikeDocument,
  LikeRecord,
  SenseSignDocument
} from '@edfu/api-interfaces';
import { ObjectId } from 'bson';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(LIKE_COLLECTION_NAME)
    private readonly likeModel: Model<LikeDocument>,
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>
  ) {}

  async create(params: ManageLikeParams): Promise<LikeRecord[]> {
    const userId = this.validateParams(params);

    if (params.senseId) {
      await this.likeModel.deleteMany({
        senseId: params.senseId,
        userId: userId
      });
      return [await this.likeModel.create(params)];
    } else {
      const senses = await this.removeLikesForSignsThatShareSensesAndReturnSenses(
        params.signId,
        userId
      );
      const createParams = senses.map(s => {
        s.userId = userId;
        return s;
      });
      return this.likeModel.insertMany(createParams);
    }
  }

  async remove(params: ManageLikeParams) {
    const userId = this.validateParams(params);
    if (params.senseId) {
      return this.likeModel.deleteMany(params);
    } else {
      return this.removeLikesForSignsThatShareSensesAndReturnSenses(
        params.signId,
        userId
      );
    }
  }

  find(params: FindLikeParams): Promise<LikeRecord[]> {
    if (!(params.senseId || params.signId || params.userId)) {
      throw new Error('Some kind of param should be specified');
    }
    return this.likeModel
      .find(params)
      .lean()
      .exec();
  }

  private async removeLikesForSignsThatShareSensesAndReturnSenses(
    signId: ObjectId,
    userId: ObjectId
  ) {
    const senses = await this.senseSignModel
      .find(
        {
          signId: signId
        },
        '-_id -__v -userId'
      )
      .lean();
    const removeParams = {
      userId: userId,
      senseId: { $in: senses.map(s => s.senseId) }
    };
    await this.likeModel.deleteMany(removeParams);
    return senses;
  }

  private validateParams(params: ManageLikeParams) {
    if (!(params.signId && params.userId)) {
      throw new Error(`Invalid params ${params}`);
    }
    return params.userId;
  }
}
