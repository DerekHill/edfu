import { Document } from "mongoose";
import { ObjectId } from "bson";
import { OxResult } from "../../oxford-api/interfaces/oxford-api.interface";

// Not sure if _id should be string
// https://stackoverflow.com/a/37927028/1450420

// Per Penguin:
// <T extends string | ObjectId = ObjectId>
// Can ask Bernardo about doing it that way

export interface OxfordSearchRecord {
  readonly _id: ObjectId;
  readonly normalizedSearchTerm: string;
  readonly result: OxResult;
  readonly homographC: number;
  readonly found: boolean;
}

export interface OxfordSearchDocument extends Document, OxfordSearchRecord {
  _id: ObjectId;
}
