import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SIGN_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { SignDocument, SignRecord } from './interfaces/sign.interface';

@Injectable()
export class SignsService {
  constructor(
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  findBySenseId(senseId: string): Promise<SignRecord[]> {
    return this.signModel
      .find({ senseId: senseId })
      .lean()
      .exec();
  }
}
