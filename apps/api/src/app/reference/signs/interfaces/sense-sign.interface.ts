import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { SenseSignRecordWithoutId } from '@edfu/api-interfaces';

export interface SenseSignRecord extends SenseSignRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SenseSignDocument extends Document, SenseSignRecord {
  _id: ObjectId;
}
