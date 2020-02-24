import { Resolver, Query, Args } from '@nestjs/graphql';
import { EntriesService } from './entries/entries.service';
// import { EntriesService } from './entries.service';
// import { NotFoundException } from '@nestjs/common';
// import { EntryDto } from './dto/entry.dto';

@Resolver('Dictionary')
export class DictionaryResolver {
  constructor(private readonly entriesService: EntriesService) {}

  @Query(() => String)
  async foo() {
    return 'bar';
  }
  @Query(returns => [String])
  oxIds(@Args('searchString') searchString: string): Promise<string[]> {
    return this.entriesService.searchOxIds(searchString);
  }
}
