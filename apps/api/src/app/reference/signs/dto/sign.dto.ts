import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'bson';
import { SignRecord } from '@edfu/api-interfaces';

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
}
