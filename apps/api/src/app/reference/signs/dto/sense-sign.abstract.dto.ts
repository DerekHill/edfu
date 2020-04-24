import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { SenseSignDtoInterface } from '@edfu/api-interfaces';

@ObjectType()
export class SenseSignAbstractDto implements SenseSignDtoInterface {
  @Field(type => ID)
  readonly userId: ObjectId;

  @Field(type => ID)
  readonly senseId: string;

  @Field(type => ID)
  readonly signId: ObjectId;
}
