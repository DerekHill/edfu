import * as mongoose from 'mongoose';

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
  ownSenseIds: {
    type: [String],
    required: true
  },
  synonymSenseIds: {
    type: [String],
    required: true
  }
});

EntrySchema.index({ oxId: 1, homographC: 1 }, { unique: true });
EntrySchema.index({ word: 1 });
