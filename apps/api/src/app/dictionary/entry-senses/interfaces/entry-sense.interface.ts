import { Document } from 'mongoose';
import { ObjectId } from 'bson';

export interface EntrySenseRecordWithoutId {
  readonly oxId: string;
  readonly homographC: number;
  readonly senseId: string;
  readonly confidence: number;
}

export interface EntrySenseRecord extends EntrySenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface EntrySenseDocument extends Document, EntrySenseRecord {
  _id: ObjectId;
}
