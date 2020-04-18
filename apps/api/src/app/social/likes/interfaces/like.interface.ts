import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { LikeRecordWithoutId } from '@edfu/api-interfaces';

export interface LikeRecord extends LikeRecordWithoutId {
  _id: any;
}

export interface LikeDocument extends Document, LikeRecord {}
