import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EMAIL_VERIFICATION_COLLECTION_NAME,
  FORGOTTEN_PASSWORD_COLLECTION_NAME,
  USER_COLLECTION_NAME
} from '../constants';
import { EmailVerificationSchema } from './schemas/emailverification.schema';
import { TestDatabaseModule } from '../config/test-database.module';
import { ForgottenPasswordSchema } from './schemas/forgottenpassword.schema';
import { UserSchema } from '../users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET
        }),
        MongooseModule.forFeature([
          {
            name: EMAIL_VERIFICATION_COLLECTION_NAME,
            schema: EmailVerificationSchema
          },
          {
            name: FORGOTTEN_PASSWORD_COLLECTION_NAME,
            schema: ForgottenPasswordSchema
          },
          {
            name: USER_COLLECTION_NAME,
            schema: UserSchema
          }
        ])
      ],
      providers: [AuthService, UsersService]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
