import { ObjectId } from 'bson';
import { SenseSignDtoInterface } from '@edfu/api-interfaces';
import { Document } from 'mongoose';

interface SignParams {
  readonly userId: ObjectId;
  readonly mnemonic: string;
  readonly s3KeyOrig: string;
  readonly transcodings?: Transcoding[];
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
