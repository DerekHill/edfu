import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { SignRecord } from '@edfu/api-interfaces';

export interface SignDocument extends Document, SignRecord {
  _id: ObjectId;
}
