import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'bson';
import { SignRecord, Transcoding } from '@edfu/api-interfaces';
import { TranscodingDto } from './transcoding.dto';

@ObjectType()
export class SignDto implements SignRecord {
  @Field(type => ID)
  _id: ObjectId;

  @Field(type => ID)
  userId: ObjectId;

  @Field()
  readonly mnemonic: string;

  @Field()
  readonly mediaUrl: string;

  @Field()
  readonly s3KeyOrig: string;

  @Field(type => TranscodingDto)
  readonly transcodings: Transcoding[];
}
