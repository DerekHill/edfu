// https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { EntriesService } from './entries.service';

@Resolver('Entries')
export class EntriesResolver {
  constructor(private readonly entriesService: EntriesService) {}

  @Query(() => String)
  async hello() {
    return 'hello there people!';
  }
}
