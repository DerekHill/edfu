import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { ObjectId } from 'bson';

export interface SignRecord {
  readonly _id: ObjectId;
  readonly mnemonic: string;
  readonly mediaUrl: string;
}

export interface SenseSignRecordWithoutId {
  readonly senseId: string;
  readonly signId: ObjectId;
}

export interface SenseSignDtoInterface extends SenseSignRecordWithoutId {
  readonly sign?: SignRecord;
}

export interface UniqueEntry {
  readonly oxId: string;
  readonly homographC: number;
}

export interface EntrySenseAssociationProperties {
  readonly associationType: DictionaryOrThesaurus;
  readonly similarity: number;
}

export interface CombinedSenseRequiredExposedProperties {
  readonly senseId: string;
  readonly ownEntryOxId: string;
  readonly ownEntryHomographC: number;
  readonly lexicalCategory: LexicalCategory;
  readonly apiSenseIndex: number;
  readonly example: string;
}

export interface CombinedSenseOptionalExposedProperties {
  readonly definition?: string;
}

export interface SenseForEntryDtoInterface
  extends UniqueEntry,
    EntrySenseAssociationProperties,
    CombinedSenseRequiredExposedProperties,
    CombinedSenseOptionalExposedProperties {
  signs?: SignRecord[];
}
