import * as mongoose from 'mongoose';

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
  confidence: {
    type: Number,
    required: true
  }
});

EntrySenseSchema.index(
  { oxId: 1, homographC: 1, senseId: 1 },
  { unique: true }
);
// Could also add index on senseId if want to find entries for sense
