import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus } from '@edfu/enums';

export interface EntrySenseRecordWithoutId {
  readonly oxId: string;
  readonly homographC: number;
  readonly senseId: string;
  readonly associationType: DictionaryOrThesaurus;
  readonly similarity: number;
}

export interface EntrySenseRecord extends EntrySenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface EntrySenseDocument extends Document, EntrySenseRecord {
  _id: ObjectId;
}
