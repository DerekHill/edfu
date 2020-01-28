import { Resolver, Query, Args } from '@nestjs/graphql';
import { SensesService } from './senses.service';
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
  @Query(returns => [SenseDto])
  //   async senses(@Args('senseIds') senseIds: string[]): Promise<SenseDto[]> {
  async senses(
    @Args({ name: 'senseIds', type: () => [String] }) senseIds: string[]
  ): Promise<SenseDto[]> {
    const senses = await this.sensesService.findMany(senseIds);
    if (!senses) {
      throw new NotFoundException(senseIds);
    }
    return senses;
  }
}
