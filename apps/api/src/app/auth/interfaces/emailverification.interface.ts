import { Document } from 'mongoose';

export interface EmailVerification extends Document {
  email: string;
  token: string;
  timestamp: Date;
}
