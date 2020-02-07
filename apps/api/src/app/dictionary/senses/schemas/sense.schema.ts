import * as mongoose from 'mongoose';
import {
  DICTIONARY_OR_THESAURUS_ALL_VALUES,
  LEXICAL_CATEGORY_ALL_VALUES
} from '@edfu/enums';

export const SenseSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  entryOxId: {
    type: String,
    required: true
  },
  entryHomographC: Number,
  lexicalCategory: {
    type: String,
    enum: LEXICAL_CATEGORY_ALL_VALUES
  },
  apiSenseIndex: {
    type: Number,
    required: true
  },
  example: {
    type: String,
    required: true
  },
  dictionaryOrThesaurus: {
    type: String,
    enum: DICTIONARY_OR_THESAURUS_ALL_VALUES,
    required: true
  },
  thesaurusSenseIds: [String],
  definition: String,
  synonyms: {
    type: [String]
  }
});

SenseSchema.index({ senseId: 1 }, { unique: true });
SenseSchema.index({ thesaurusSenseIds: 1 });
