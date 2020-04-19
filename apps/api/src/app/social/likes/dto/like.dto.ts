import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { LikeRecordWithoutId } from '@edfu/api-interfaces';

@ObjectType()
export class LikeDto implements LikeRecordWithoutId {
  @Field(type => ID)
  readonly userId: ObjectId;

  @Field(type => ID)
  readonly senseId: string;

  @Field(type => ID)
  readonly signId: ObjectId;
}
