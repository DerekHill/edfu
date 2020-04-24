import { Document } from 'mongoose';
import {
  DictionaryOrThesaurus,
  LexicalCategory,
  UniqueEntry,
  EntrySenseAssociationProperties,
  SignDtoInterface
} from '@edfu/api-interfaces';

interface CoreSenseParams {
  readonly senseId: string;
  readonly ownEntryOxId: string;
  readonly ownEntryHomographC: number;
  readonly lexicalCategory: LexicalCategory;
  readonly apiSenseIndex: number;
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
  readonly example?: string;
}

export interface DictionarySenseParams extends CoreSenseParams {
  readonly definition?: string;
  readonly thesaurusSenseIds: string[];
}

export interface ThesaurusSenseParams extends CoreSenseParams {
  readonly synonyms: string[];
}

export type AllSenseParams = CoreSenseParams &
  Partial<DictionarySenseParams> &
  Partial<ThesaurusSenseParams>;

export interface DictionarySenseRecord extends DictionarySenseParams {
  _id: any;
}

export interface ThesaurusSenseRecord extends ThesaurusSenseParams {
  _id: any;
}

export interface SenseDocument extends Document, AllSenseParams {}

export interface LinkedSensePairing {
  readonly thesaurusSense: ThesaurusSenseRecord;
  readonly dictionarySenses: DictionarySenseRecord[];
}

export type SenseHydratedDtoInterface = Omit<
  CoreSenseParams,
  'dictionaryOrThesaurus'
> &
  Pick<DictionarySenseParams, 'definition'> &
  UniqueEntry &
  EntrySenseAssociationProperties & { signs?: SignDtoInterface[] };

export interface SensePureDtoInterface extends AllSenseParams {}
