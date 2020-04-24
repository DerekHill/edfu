import { ObjectId } from 'bson';
import { SenseSignDtoInterface } from '@edfu/api-interfaces';
import { Document } from 'mongoose';

export interface SignParams {
  readonly userId: ObjectId;
  readonly s3KeyOrig: string;
  readonly mnemonic?: string;
  readonly transcodings?: Transcoding[];
}

export interface DeleteSignParams {
  _id: ObjectId;
  userId: ObjectId;
}

export interface SignRecord extends SignParams {
  _id: any;
}

export interface SignDocument extends Document, SignRecord {}

export interface SignDtoInterface extends SignRecord {
  readonly senseSigns?: SenseSignDtoInterface[];
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
