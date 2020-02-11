import { Document } from 'mongoose';
import { ObjectId } from 'bson';

export interface SignRecordWithoutId {
  readonly mnemonic: string;
  readonly mediaUrl: string;
}

export interface SignRecord extends SignRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SignDocument extends Document, SignRecord {
  _id: ObjectId;
}
