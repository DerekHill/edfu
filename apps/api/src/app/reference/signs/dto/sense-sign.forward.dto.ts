import { ObjectType, Field } from '@nestjs/graphql';
import { SenseSignAbstractDto } from './sense-sign.abstract.dto';
import { SignDto } from './sign.dto';

@ObjectType()
export class SenseSignForwardDto extends SenseSignAbstractDto {
  @Field(type => SignDto, { nullable: true })
  readonly sign?: SignDto;
}
