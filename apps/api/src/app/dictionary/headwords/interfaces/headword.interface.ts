import { Document } from 'mongoose';
import { ObjectId } from 'bson';

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
