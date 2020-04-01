import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

const TranscodingSchema = new mongoose.Schema({
  height: Number,
  width: Number,
  durationSeconds: Number,
  s3Key: String,
  size: Number,
  preset: String
});

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
  },
  s3KeyOrig: {
    type: String,
    required: true
  },
  transcodings: [TranscodingSchema]
});

SignSchema.index({ mediaUrl: 1 }, { unique: true });
SignSchema.index({ userId: 1 });
SignSchema.index({ s3KeyOrig: 1 });
