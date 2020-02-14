import * as mongoose from 'mongoose';
import { CASE_INSENSITIVE_COLLATION } from '../../../constants';

export const EntrySchema = new mongoose.Schema({
  oxId: {
    type: String,
    required: true
  },
  homographC: {
    type: Number,
    required: true
  },
  word: {
    type: String,
    required: true
  },
  relatedEntriesAdded: {
    type: Boolean,
    required: true
  },
  headwordOrPhrase: {
    type: String,
    required: true
  }
});

EntrySchema.index({ oxId: 1, homographC: 1 }, { unique: true });

EntrySchema.index({ word: 1 }, { collation: CASE_INSENSITIVE_COLLATION });
