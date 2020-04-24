import { ObjectId } from 'bson';
import { Document } from 'mongoose';
import { Optional } from 'utility-types';

interface LikeParams {
  readonly userId: ObjectId;
  readonly signId: ObjectId;
  readonly senseId: string;
}

export interface LikeRecord extends LikeParams {
  _id: any;
}
export interface LikeDocument extends Document, LikeRecord {}

export type FindLikeParams = Partial<LikeParams>;

export type ManageLikeParams = Optional<LikeParams, 'senseId'>;

export type LikeDtoInterface = LikeParams;
