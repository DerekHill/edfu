import { Field, ID, ArgsType } from '@nestjs/graphql';
import { FindLikeArgs } from './find-like.args';
import { ObjectId } from 'bson';

@ArgsType()
export class ManageLikeArgs extends FindLikeArgs {
  @Field(type => ID)
  readonly signId: ObjectId;
}
