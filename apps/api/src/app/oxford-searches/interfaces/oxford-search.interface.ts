import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { OxResult } from '../../oxford-api/interfaces/oxford-api.interface';

export interface OxfordSearchRecord {
  readonly _id: ObjectId;
  readonly oxIdOrSearchTermLowercase: string;
  readonly result: OxResult;
  readonly homographC: number;
}

export interface OxfordSearchDocument extends Document, OxfordSearchRecord {
  _id: ObjectId;
}
