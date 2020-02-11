import { Document } from 'mongoose';
import { ObjectId } from 'bson';

export interface SenseSignRecordWithoutId {
  readonly senseId: string;
  readonly signId: ObjectId;
}

export interface SenseSignRecord extends SenseSignRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SenseSignDocument extends Document, SenseSignRecord {
  _id: ObjectId;
}
