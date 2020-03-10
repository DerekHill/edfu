import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    username: {
      type: String,
      unique: true,
      required: true
    },

    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    emailConfirmationToken: String,
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmedAt: Date,
    unconfirmedEmail: String,

    roles: [String]
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
