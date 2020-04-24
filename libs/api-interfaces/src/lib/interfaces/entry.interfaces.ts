import { Document } from 'mongoose';
import { HeadwordOrPhrase } from '@edfu/api-interfaces';

export interface UniqueEntry {
  readonly oxId: string;
  readonly homographC: number;
}

export interface EntryParams extends UniqueEntry {
  readonly word: string;
  readonly relatedEntriesAdded: boolean;
  readonly headwordOrPhrase: HeadwordOrPhrase;
}

export interface EntryRecord extends EntryParams {
  _id: any;
}

export interface EntryDocument extends Document, EntryRecord {
  _id: any;
}
