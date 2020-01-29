import { Document } from 'mongoose';
import { ObjectId } from 'bson';

export interface SignRecordWithoutId {
  readonly senseId: string;
  readonly mnemonic: string;
  readonly media_url: string;
}

export interface SignRecord extends SignRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SignDocument extends Document, SignRecord {
  _id: ObjectId;
}
