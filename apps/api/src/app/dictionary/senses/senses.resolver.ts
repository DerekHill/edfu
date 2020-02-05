import { Resolver, Query, Args } from '@nestjs/graphql';
import { SensesService } from './senses.service';
import { SenseForEntryDto } from '@edfu/api-interfaces';

@Resolver('Senses')
export class SensesResolver {
  constructor(private readonly sensesService: SensesService) {}

  @Query(returns => [SenseForEntryDto])
  sensesForEntry(
    @Args('oxId') oxId: string,
    @Args('homographC') homographC: number
  ): Promise<SenseForEntryDto[]> {
    return this.sensesService.getSensesForEntry(oxId, homographC);
  }
}
