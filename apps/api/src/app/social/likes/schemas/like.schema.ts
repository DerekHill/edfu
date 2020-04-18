import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export const LikeSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  signId: {
    type: ObjectId,
    required: true
  },
  userId: {
    type: ObjectId,
    required: true
  }
});

LikeSchema.index({ signId: 1, senseId: 1 });
LikeSchema.index({ signId: 1, userId: 1, senseId: 1 });
LikeSchema.index({ senseId: 1, userId: 1 }, { unique: true });
