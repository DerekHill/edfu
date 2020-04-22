import { ObjectType, Field } from '@nestjs/graphql';
import { SensePureDto } from '../../senses/dto/sense.pure.dto';
import { SenseSignAbstractDto } from './sense-sign.abstract.dto';

@ObjectType()
export class SenseSignBackDto extends SenseSignAbstractDto {
  @Field(() => SensePureDto, { nullable: true })
  readonly sense?: SensePureDto;
}
