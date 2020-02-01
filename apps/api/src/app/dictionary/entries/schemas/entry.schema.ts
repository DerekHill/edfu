import * as mongoose from 'mongoose';
import { HeadwordOrPhrase } from '../../../enums';

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
    enum: [HeadwordOrPhrase.headword, HeadwordOrPhrase.phrase],
    required: true
  }
});

EntrySchema.index({ oxId: 1, homographC: 1 }, { unique: true });
EntrySchema.index({ word: 1 });
