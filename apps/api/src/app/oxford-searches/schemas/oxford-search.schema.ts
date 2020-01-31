import * as mongoose from 'mongoose';

export const OxfordSearchSchema = new mongoose.Schema({
  normalizedSearchTerm: String,
  result: Object,
  homographC: Number,
  found: Boolean
});

OxfordSearchSchema.index(
  { normalizedSearchTerm: 1, homographC: 1 },
  { unique: true }
);
