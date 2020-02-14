import * as mongoose from 'mongoose';
import { CASE_INSENSITIVE_COLLATION } from '../../constants';

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
  { collation: CASE_INSENSITIVE_COLLATION }
);
