import { Resolver, Query, Args } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { EntriesService } from './entries/entries.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver('Lexicographer')
@UseGuards(GqlAuthGuard)
export class LexicographerResolver {
  constructor(
    private readonly referenceService: ReferenceService,
    private readonly entriesService: EntriesService
  ) {}

  @Query(returns => [SenseForEntryDto], { name: 'sensesFromApi' })
  async getSensesFromApi(
    @Args('searchString') searchString: string
  ): Promise<SenseForEntryDto[]> {
    if (!searchString) {
      return [];
    }
    const entries = await this.entriesService.findOrCreateAndKickoffRelatedEntries(
      searchString
    );
    if (!entries.length) {
      return [];
    } else {
      return this.referenceService.sensesForOxIdCaseInsensitive({
        oxId: entries[0].oxId,
        filterForHasSign: false,
        filterForDictionarySenses: true
      });
    }
  }
}
