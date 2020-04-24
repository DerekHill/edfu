import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { Transcoding, SignDtoInterface } from '@edfu/api-interfaces';
import { TranscodingDto } from './transcoding.dto';
import { SenseSignBackDto } from './sense-sign.back.dto';

@ObjectType()
export class SignDto implements SignDtoInterface {
  @Field(type => ID)
  _id: ObjectId;

  @Field(type => ID)
  userId: ObjectId;

  @Field({ nullable: true })
  readonly mnemonic?: string;

  @Field()
  readonly s3KeyOrig: string;

  @Field(type => [TranscodingDto], { nullable: true })
  readonly transcodings?: Transcoding[];

  @Field(type => [SenseSignBackDto], { nullable: true })
  readonly senseSigns?: SenseSignBackDto[];
}
