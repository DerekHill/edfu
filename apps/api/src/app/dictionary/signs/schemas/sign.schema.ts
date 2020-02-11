import * as mongoose from 'mongoose';

// Need to add userId
export const SignSchema = new mongoose.Schema({
  mnemonic: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  }
});

SignSchema.index({ senseId: 1 });
