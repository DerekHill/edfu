import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export const SignSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  mnemonic: {
    type: String
  },
  mediaUrl: {
    type: String,
    required: true
  }
});

SignSchema.index({ mediaUrl: 1 });
