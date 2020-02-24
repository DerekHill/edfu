import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import {
  CombinedSenseRequiredExposedProperties,
  CombinedSenseOptionalExposedProperties
} from '@edfu/api-interfaces';

interface CombinedSenseRequiredInternalProperties {
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
}

interface CombinedSenseRequiredAllProperties
  extends CombinedSenseRequiredInternalProperties,
    CombinedSenseRequiredExposedProperties {}

interface CombinedSenseOptionalInternalProperties {
  readonly thesaurusSenseIds?: string[];
  readonly synonyms?: string[];
}

export interface SharedSenseRecordWithoutId
  extends CombinedSenseRequiredAllProperties,
    CombinedSenseOptionalInternalProperties,
    CombinedSenseOptionalExposedProperties {}

export interface DictionarySenseRecordWithoutId
  extends CombinedSenseRequiredAllProperties {
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary;
  readonly thesaurusSenseIds: string[];
  readonly definition: string;
}

export interface ThesaurusSenseRecordWithoutId
  extends CombinedSenseRequiredAllProperties {
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
