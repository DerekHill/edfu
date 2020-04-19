import { Field, ID, ArgsType } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { FindLikeParams } from '@edfu/api-interfaces';

@ArgsType()
export class FindLikeArgs implements FindLikeParams {
  @Field(type => ID, { nullable: true })
  readonly senseId?: string;

  @Field(type => ID, { nullable: true })
  readonly signId?: ObjectId;
}
