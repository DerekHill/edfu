import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { ObjectId } from 'bson';

export interface SignRecordWithoutId {
  readonly userId: ObjectId;
  readonly mnemonic: string;
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
  readonly _id: ObjectId;
  readonly email: string;
  readonly username: string;
  readonly roles: string[];
  readonly access_token?: string;
}

export interface IResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  data: any;
  error: any;
}

export interface VideoProperties {
  height: number;
  width: number;
  duration: number;
  size: number;
  bitrate: number;
  rotation: number;
}

export interface Transcoding extends VideoProperties {
  s3Key: string;
}

export interface CreateUserDtoInterface {
  readonly username: string;
  readonly email: string;
  password: string;
}

export interface FindLikeParams {
  readonly userId?: ObjectId;
  readonly signId?: ObjectId;
  readonly senseId?: string;
}

// Refactor https://www.typescriptlang.org/docs/handbook/utility-types.html
export interface ManageLikeParams extends FindLikeParams {
  readonly userId: ObjectId;
  readonly signId: ObjectId;
  readonly senseId?: string;
}

// Refactor https://www.typescriptlang.org/docs/handbook/utility-types.html
export interface LikeRecordWithoutId extends ManageLikeParams {
  readonly userId: ObjectId;
  readonly signId: ObjectId;
  readonly senseId: string;
}
