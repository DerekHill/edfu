import * as mongoose from 'mongoose';
import { DICTIONARY_OR_THESAURUS_ALL_VALUES } from '@edfu/api-interfaces';
import { CASE_INSENSITIVE_COLLATION } from '../../../constants';

export const EntrySenseSchema = new mongoose.Schema({
  oxId: {
    type: String,
    required: true
  },
  homographC: {
    type: Number,
    required: true
  },
  senseId: {
    type: String,
    required: true
  },
  associationType: {
    type: String,
    enum: DICTIONARY_OR_THESAURUS_ALL_VALUES,
    required: true
  },
  similarity: {
    type: Number,
    required: true
  }
});

EntrySenseSchema.index(
  { oxId: 1, homographC: 1, senseId: 1 },
  { unique: true }
);

EntrySenseSchema.index({ oxId: 1 }, { collation: CASE_INSENSITIVE_COLLATION });
