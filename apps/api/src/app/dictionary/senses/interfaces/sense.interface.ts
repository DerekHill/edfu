import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

interface SharedRequiredProperties {
  readonly senseId: string;
  readonly entryOxId: string;
  readonly entryHomographC: number;
  readonly lexicalCategory: LexicalCategory;
  readonly apiSenseIndex: number;
  readonly example: string;
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
}

// Not DRY with below, but exists to enable single SenseDocument
interface SharedOptionalProperties {
  readonly thesaurusSenseIds?: string[];
  readonly definition?: string;
  readonly synonyms?: string[];
}

export interface SharedSenseRecordWithoutId
  extends SharedRequiredProperties,
    SharedOptionalProperties {}

export interface DictionarySenseRecordWithoutId
  extends SharedRequiredProperties {
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary;
  readonly thesaurusSenseIds: string[];
  readonly definition: string;
}

export interface ThesaurusSenseRecordWithoutId
  extends SharedRequiredProperties {
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus;
  readonly synonyms: string[];
}

export interface DictionarySenseRecord extends DictionarySenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface ThesaurusSenseRecord extends ThesaurusSenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SenseDocument extends Document, SharedSenseRecordWithoutId {
  _id: ObjectId;
}

export interface LinkedSensePairing {
  readonly thesaurusSense: ThesaurusSenseRecord;
  readonly dictionarySenses: DictionarySenseRecord[];
}
