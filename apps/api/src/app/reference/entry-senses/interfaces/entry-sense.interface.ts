import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import {
  UniqueEntry,
  EntrySenseAssociationProperties
} from '@edfu/api-interfaces';

export interface EntrySenseRecordWithoutId
  extends UniqueEntry,
    EntrySenseAssociationProperties {
  readonly senseId: string;
}

export interface EntrySenseRecord extends EntrySenseRecordWithoutId {
  readonly _id: ObjectId;
}

export interface EntrySenseDocument extends Document, EntrySenseRecord {
  _id: ObjectId;
}
