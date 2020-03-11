import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EMAIL_VERIFICATION_COLLECTION_NAME,
  FORGOTTEN_PASSWORD_COLLECTION_NAME
} from '../constants';
import { EmailVerificationSchema } from './schemas/emailverification.schema';
import { ForgottenPasswordSchema } from './schemas/forgottenpassword.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '365d' }
    }),
    MongooseModule.forFeature([
      {
        name: EMAIL_VERIFICATION_COLLECTION_NAME,
        schema: EmailVerificationSchema
      },
      {
        name: FORGOTTEN_PASSWORD_COLLECTION_NAME,
        schema: ForgottenPasswordSchema
      }
    ])
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
