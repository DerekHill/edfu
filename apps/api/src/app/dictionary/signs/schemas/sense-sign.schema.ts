import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';

export const SenseSignSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  signId: {
    type: ObjectId,
    required: true
  }
});

SenseSignSchema.index({ senseId: 1, signId: 1 }, { unique: true });
