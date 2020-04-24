import { ObjectId } from 'bson';
import { SignDtoInterface, AllSenseParams } from '@edfu/api-interfaces';
import { Document } from 'mongoose';

export interface SenseSignParams {
  readonly userId: ObjectId;
  readonly senseId: string;
  readonly signId: ObjectId;
}

export interface SenseSignRecord extends SenseSignParams {
  _id: any;
}

export interface SenseSignDocument extends Document, SenseSignRecord {}

export interface SenseSignDtoInterface extends SenseSignParams {
  readonly sign?: SignDtoInterface;
  readonly sense?: AllSenseParams;
}
