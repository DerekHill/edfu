import { Document } from 'mongoose';
import { ObjectId } from 'bson';

export interface EntryRecordWithoutId {
  readonly oxId: string;
  readonly homographC: number;
  readonly word: string;
  readonly topLevel: boolean;
  readonly ownSenseIds: string[]; // deprecated
  readonly synonymSenseIds: string[]; // deprecated
}

export interface EntryRecord extends EntryRecordWithoutId {
  readonly _id: ObjectId;
}

export interface EntryDocument extends Document, EntryRecord {
  _id: ObjectId;
}
