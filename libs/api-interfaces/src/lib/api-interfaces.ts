import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { ObjectId } from 'bson';

export interface SignRecordWithoutId {
  readonly userId: ObjectId;
  readonly mnemonic: string;
  readonly mediaUrl: string;
  readonly s3KeyOrig: string;
  readonly transcodings?: Transcoding[];
}

export interface SignRecord extends SignRecordWithoutId {
  readonly _id: ObjectId;
}

export interface SenseSignRecordWithoutId {
  readonly userId: ObjectId;
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

export interface HydratedSense
  extends UniqueEntry,
    EntrySenseAssociationProperties,
    CombinedSenseRequiredExposedProperties,
    CombinedSenseOptionalExposedProperties {
  signs?: SignRecord[];
}

export interface BasicUser {
  readonly email: string;
  readonly username: string;
  readonly roles: string[];
  readonly access_token?: string;
}

export interface CreateSignInputInterface {
  readonly mnemonic: string;
  readonly mediaUrl: string;
  readonly s3KeyOrig: string;
  readonly senseIds: string[];
}

export interface IResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  data: any;
  error: any;
}

export enum VimeoVideoStatus {
  available = 'available',
  uploading = 'uploading',
  transcoding = 'transcoding',
  uploading_error = 'uploading_error',
  transcoding_error = 'transcoding_error',
  not_found = 'not_found' // requested video couldn't be found
}

// https://handbrake.fr/docs/en/latest/technical/official-presets.html
export enum HandbrakePreset {
  Very_Fast_480p30 = 'Very Fast 480p30',
  noop = 'noop'
}

export interface HandbrakeVideoProperties {
  height: number;
  width: number;
  durationSeconds: number;
}

export interface Transcoding extends HandbrakeVideoProperties {
  s3Key: string;
  size: number;
  preset: HandbrakePreset;
}
