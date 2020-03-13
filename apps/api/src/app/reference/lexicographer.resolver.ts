import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { EntriesService } from './entries/entries.service';
import { CreateSignInput } from './signs/dto/create-sign.input';
import { SignDto } from './signs/dto/sign.dto';
import { SignsService } from './signs/signs.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BasicUser } from '@edfu/api-interfaces';
import { UsersService } from '../users/users.service';

@Resolver('Lexicographer')
@UseGuards(GqlAuthGuard)
export class LexicographerResolver {
  constructor(
    private readonly referenceService: ReferenceService,
    private readonly entriesService: EntriesService,
    private readonly signsService: SignsService,
    private readonly usersService: UsersService
  ) {}

  @Query(returns => [SenseForEntryDto], { name: 'sensesFromApi' })
  async getSensesFromApi(
    @Args('searchString') searchString: string
  ): Promise<SenseForEntryDto[]> {
    const entries = await this.entriesService.findOrCreateAndKickoffRelatedEntries(
      searchString
    );
    if (!entries.length) {
      return [];
    } else {
      return this.referenceService.getSensesForOxIdCaseInsensitive(
        entries[0].oxId,
        false,
        ''
      );
    }
  }

  @Mutation(returns => SignDto)
  async createSignWithAssociations(
    @CurrentUser() user: BasicUser,
    @Args('createSignData') createSignData: CreateSignInput,
    @Args({ name: 'senseIds', type: () => [String] }) senseIds: string[]
  ) {
    const fullUser = await this.usersService.findByEmail(user.email);
    const sign = await this.signsService.createSignWithAssociations(
      { ...createSignData, ...{ userId: fullUser._id } },
      senseIds
    );
    return sign;
  }
}
