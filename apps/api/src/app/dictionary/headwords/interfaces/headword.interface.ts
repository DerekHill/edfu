import { Document } from 'mongoose';
import { ObjectId } from 'bson';

// Maybe better to have optional properties on HeadwordRecord
// like on SenseRecord
export interface HeadwordRecordWithoutId {
  readonly oxId: string;
  readonly homographC: number;
  readonly word: string;
  readonly topLevel: boolean;
  readonly ownSenseIds: string[];
  readonly synonymSenseIds: string[];
}

export interface HeadwordRecord extends HeadwordRecordWithoutId {
  readonly _id: ObjectId;
}

export interface HeadwordDocument extends Document, HeadwordRecord {
  _id: ObjectId;
}
