import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { HeadwordOrPhrase } from '../../../enums';

export interface EntryRecordWithoutId {
  readonly oxId: string;
  readonly homographC: number;
  readonly word: string;
  readonly relatedEntriesAdded: boolean;
  readonly headwordOrPhrase: HeadwordOrPhrase;
}

export interface EntryRecord extends EntryRecordWithoutId {
  readonly _id: ObjectId;
}

export interface EntryDocument extends Document, EntryRecord {
  _id: ObjectId;
}
