import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { OxThesaurusLink } from '../../../oxford-api/interfaces/oxford-api.interface';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

export interface SenseRecordWithoutId {
  readonly senseId: string;
  readonly entryOxId: string;
  readonly entryHomographC: number;
  readonly dictionaryOrThesaurus?: DictionaryOrThesaurus;
  readonly lexicalCategory?: LexicalCategory;
  readonly thesaurusLinks?: OxThesaurusLink[];
  readonly example?: string;
  readonly definition?: string;
  readonly synonyms: string[];
}
export interface SenseRecord extends SenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SenseDocument extends Document, SenseRecord {
  _id: ObjectId;
}
