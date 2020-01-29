import * as mongoose from 'mongoose';

export const SignSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  mnemonic: {
    type: String,
    required: true
  },
  media_url: {
    type: String,
    required: true
  }
});

SignSchema.index({ senseId: 1 });
