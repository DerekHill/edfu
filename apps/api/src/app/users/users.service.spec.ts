import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TestDatabaseModule } from '../config/test-database.module';
import { USER_COLLECTION_NAME } from '../constants';
import { UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          {
            name: USER_COLLECTION_NAME,
            schema: UserSchema
          }
        ])
      ],
      providers: [UsersService]
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
