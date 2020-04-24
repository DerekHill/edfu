import { Document } from 'mongoose';
import { UniqueEntry, DictionaryOrThesaurus } from '@edfu/api-interfaces';

export interface EntrySenseAssociationProperties {
  readonly associationType: DictionaryOrThesaurus;
  readonly similarity: number;
}

export interface EntrySenseParams
  extends UniqueEntry,
    EntrySenseAssociationProperties {
  readonly senseId: string;
}

export interface EntrySenseRecord extends EntrySenseParams {
  _id: any;
}

export interface EntrySenseDocument extends Document, EntrySenseRecord {}
