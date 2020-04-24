import { Document } from 'mongoose';

interface UserRecord {
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

export interface BasicUser {
  readonly _id: any;
  readonly email: string;
  readonly username: string;
  readonly roles: string[];
  readonly access_token?: string;
}

export interface CreateUserDtoInterface {
  readonly username: string;
  readonly email: string;
  password: string;
}
