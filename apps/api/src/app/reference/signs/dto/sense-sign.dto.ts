import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { SignDto } from './sign.dto';
import { SenseSignDtoInterface } from '@edfu/api-interfaces';

@ObjectType()
export class SenseSignDto implements SenseSignDtoInterface {
  @Field(type => ID)
  readonly userId: ObjectId;

  @Field(type => ID)
  readonly senseId: string;

  @Field(type => ID)
  readonly signId: ObjectId;

  @Field(type => SignDto, { nullable: true })
  readonly sign?: SignDto;
}
