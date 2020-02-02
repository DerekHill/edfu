// https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { EntrySenseDto } from '@edfu/api-interfaces';
import { EntrySensesService } from './entry-senses.service';

@Resolver('EntrySenses')
export class EntriesResolver {
  constructor(private readonly entrySensesService: EntrySensesService) {}

  @Query(returns => [EntrySenseDto])
  entrySenses(
    @Args('oxId') oxId: string,
    @Args('homographC') homographC: number
  ): Promise<EntrySenseDto[]> {
    return this.entrySensesService.findByEntryProperties(oxId, homographC);
  }
}
