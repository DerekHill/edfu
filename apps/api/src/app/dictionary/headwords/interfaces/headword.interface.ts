import { Document } from "mongoose";
import { ObjectId } from "bson";

export interface HeadwordRecord {
  readonly _id: ObjectId;
  readonly oxId: string;
  readonly homographC: number;
  readonly word: string;
  readonly topLevel: boolean;
  readonly ownSenseIds: string[];
  readonly synonymSenseIds: string[];
}

export interface HeadwordDocument extends Document, HeadwordRecord {
  _id: ObjectId;
}
