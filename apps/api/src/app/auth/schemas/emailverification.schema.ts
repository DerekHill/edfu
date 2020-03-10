import * as mongoose from 'mongoose';

export const EmailVerificationSchema = new mongoose.Schema({
  email: String,
  token: String,
  timestamp: Date
});
