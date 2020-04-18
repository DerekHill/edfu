import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeSchema } from './likes/schemas/like.schema';
import { LIKE_COLLECTION_NAME } from '../constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LIKE_COLLECTION_NAME, schema: LikeSchema }
    ])
  ],
  controllers: [],
  providers: [],
  exports: []
})
export class SocialModule {}
