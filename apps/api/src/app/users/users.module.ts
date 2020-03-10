import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME } from '../constants';
import { UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_COLLECTION_NAME, schema: UserSchema }
    ])
  ],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
