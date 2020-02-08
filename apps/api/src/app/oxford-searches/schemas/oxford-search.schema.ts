import * as mongoose from 'mongoose';

export const OxfordSearchSchema = new mongoose.Schema({
  oxIdOrSearchTermLowercase: String,
  homographC: Number,
  result: Object
});

OxfordSearchSchema.index(
  { oxIdOrSearchTermLowercase: 1, homographC: 1 },
  { unique: true }
);

OxfordSearchSchema.index(
  { oxIdOrSearchTermLowercase: 1 },
  { collation: { locale: 'en', strength: 2 } }
);
