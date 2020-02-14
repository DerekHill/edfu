// https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { EntriesService } from './entries.service';
import { EntryDto } from '@edfu/api-interfaces';
import { NotFoundException } from '@nestjs/common';

@Resolver('Entries')
export class EntriesResolver {
  constructor(private readonly entriesService: EntriesService) {}

  @Query(() => String)
  async hello() {
    return 'hello there people!';
  }

  @Query(returns => EntryDto)
  async entry(@Args('id') id: string): Promise<EntryDto> {
    const entry = await this.entriesService.findOneById(id);
    if (!entry) {
      throw new NotFoundException(id);
    }
    return entry;
  }

  @Query(returns => [EntryDto])
  entriesAll(): Promise<EntryDto[]> {
    return this.entriesService.findAll();
  }

  @Query(returns => [EntryDto])
  searchDeprecated(
    @Args('searchString') searchString: string
  ): Promise<EntryDto[]> {
    return this.entriesService.searchDeprecated(searchString);
  }

  @Query(returns => [String])
  oxIds(@Args('searchString') searchString: string): Promise<string[]> {
    return this.entriesService.searchOxIds(searchString);
  }
}
