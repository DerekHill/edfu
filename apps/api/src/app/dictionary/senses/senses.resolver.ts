import { Resolver, Query, Args } from '@nestjs/graphql';
import { SensesService } from './Senses.service';
import { SenseDto } from '@edfu/api-interfaces';
import { NotFoundException } from '@nestjs/common';

@Resolver('Senses')
export class SensesResolver {
  constructor(private readonly sensesService: SensesService) {}

  @Query(returns => SenseDto)
  async sense(@Args('senseId') senseId: string): Promise<SenseDto> {
    const sense = await this.sensesService.findOne(senseId);
    if (!sense) {
      throw new NotFoundException(senseId);
    }
    return sense;
  }
}
