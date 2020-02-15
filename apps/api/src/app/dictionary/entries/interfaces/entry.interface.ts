import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { HeadwordOrPhrase } from '../../../enums';
import { UniqueEntry } from '@edfu/api-interfaces';

export interface EntryRecordWithoutId extends UniqueEntry {
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
