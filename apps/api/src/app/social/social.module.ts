import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeSchema } from './likes/schemas/like.schema';
import { LIKE_COLLECTION_NAME, SENSE_SIGN_COLLECTION_NAME } from '../constants';
import { SocialResolver } from './social.resolver';
import { LikesService } from './likes/likes.service';
import { SenseSignSchema } from '../reference/signs/schemas/sense-sign.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LIKE_COLLECTION_NAME, schema: LikeSchema },
      { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema }
    ]),
    UsersModule
  ],
  controllers: [],
  providers: [LikesService, SocialResolver],
  exports: []
})
export class SocialModule {}
