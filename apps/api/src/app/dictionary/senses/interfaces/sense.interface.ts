import { Document } from "mongoose";
import { ObjectId } from "bson";
import { DictionaryOrThesaurus, LexicalCategory } from "../../../enums";
import { OxThesaurusLink } from "../../../oxford-api/interfaces/oxford-api.interface";

export interface SenseRecord {
  readonly _id: ObjectId;
  readonly senseId: string;
  readonly headwordOxId: string;
  readonly headwordHomographC: number;
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
  readonly lexicalCategory: LexicalCategory;
  readonly thesaurusLinks: OxThesaurusLink[];
  readonly example: string;
  readonly definition: string;
  readonly synonyms: string[];
}

export interface SenseDocument extends Document, SenseRecord {
  _id: ObjectId;
}
