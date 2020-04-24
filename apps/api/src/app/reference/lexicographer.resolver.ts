import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Root,
  Parent,
  Mutation,
  ID
} from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseHydratedDto } from './senses/dto/sense.hydrated.dto';
import { EntriesService } from './entries/entries.service';
import { UseGuards } from '@nestjs/common';
import { GqlPassportAuthGuard } from '../auth/guards/gql-passport.auth.guard';
import { SignDto } from './signs/dto/sign.dto';
import { GqlHydrateUserAuthGuard } from '../auth/guards/gql-hydrate-user-auth.guard';
import { BasicUser } from '@edfu/api-interfaces';
import { CurrentUserGraphQL } from '../common/decorators/current-user.decorator';
import { SenseSignBackDto } from './signs/dto/sense-sign.back.dto';
import { SensePureDto } from './senses/dto/sense.pure.dto';
import { ObjectId } from 'bson';

@Resolver('Lexicographer')
@UseGuards(GqlPassportAuthGuard)
export class LexicographerResolver {
  constructor(
    private readonly referenceService: ReferenceService,
    private readonly entriesService: EntriesService
  ) {}

  @Query(() => [SenseHydratedDto], { name: 'hydratedSensesLex' })
  async getHydratedSensesLex(
    @Args('searchString') searchString: string
  ): Promise<SenseHydratedDto[]> {
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

@Resolver(() => SignDto)
@UseGuards(GqlHydrateUserAuthGuard)
export class SignsResolver {
  constructor(private readonly referenceService: ReferenceService) {}
  @Query(() => [SignDto], { name: 'signs' })
  getSigns(@CurrentUserGraphQL() user: BasicUser): Promise<SignDto[]> {
    return this.referenceService.getSignsForUser(user._id);
  }
  @ResolveField(() => [SenseSignBackDto])
  senseSigns(@Root() sign: SignDto) {
    return this.referenceService.getSenseSigns({ signId: sign._id });
  }

  @Mutation(returns => Boolean)
  async deleteSign(
    @CurrentUserGraphQL() user: BasicUser,
    @Args({ name: 'signId', type: () => ID }) signId: ObjectId
  ) {
    await this.referenceService.deleteSignAndAssociations({
      _id: signId,
      userId: user._id
    });
    return true;
  }
}

@Resolver(() => SenseSignBackDto)
export class SenseSignsBackResolver {
  constructor(private readonly referenceService: ReferenceService) {}

  @ResolveField(() => SensePureDto, { name: 'sense' })
  getSenses(@Parent() senseSign: SenseSignBackDto): Promise<SensePureDto[]> {
    return this.referenceService.findSenseById(senseSign.senseId);
  }
}
