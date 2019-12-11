import * as mongoose from "mongoose";

export const HeadwordSchema = new mongoose.Schema({
  oxId: {
    type: String,
    required: true
  },
  homographC: Number,
  word: {
    type: String,
    required: true
  },
  topLevel: Boolean,
  ownSenseIds: [String],
  synonymSenseIds: [String]
});

HeadwordSchema.index({ oxId: 1, homographC: 1 }, { unique: true });
