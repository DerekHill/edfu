import * as mongoose from 'mongoose';

export const HeadwordSchema = new mongoose.Schema({
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
  topLevel: {
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

HeadwordSchema.index({ oxId: 1, homographC: 1 }, { unique: true });
HeadwordSchema.index({ word: 1 });
