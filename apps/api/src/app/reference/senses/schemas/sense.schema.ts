import * as mongoose from 'mongoose';
import { DICTIONARY_OR_THESAURUS_ALL_VALUES } from '@edfu/api-interfaces';

export const SenseSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  ownEntryOxId: {
    type: String,
    required: true
  },
  ownEntryHomographC: Number,
  lexicalCategory: {
    type: String,
    required: true
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
