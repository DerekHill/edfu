import { Document } from 'mongoose';

export interface UserRecord {
  _id: any;
  email: string;
  username: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  emailConfirmationToken: string;
  emailConfirmed: boolean;
  emailConfirmedAt: Date;
  unconfirmedEmail: string;
  roles: string[];
}

export interface UserDocument extends Document, UserRecord {}
