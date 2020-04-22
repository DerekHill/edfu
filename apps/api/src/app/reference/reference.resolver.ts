import { Resolver, Query, Args, Root, ResolveField } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseHydratedDto } from './senses/dto/sense.hydrated.dto';
import { SenseSignForwardDto } from './signs/dto/sense-sign.forward.dto';
import { SignDto } from './signs/dto/sign.dto';

@Resolver(() => SenseHydratedDto)
export class DictionaryResolver {
  constructor(private readonly service: ReferenceService) {}

  @Query(() => [String], { name: 'oxIds' })
  getOxIds(
    @Args('searchString') searchString: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean
  ): Promise<string[]> {
    return this.service.searchOxIds(searchString, filter);
  }

  @Query(() => [SenseHydratedDto], { name: 'hydratedSensesExisting' })
  getHydratedSensesExisting(
    @Args('oxId') oxId: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean,
    @Args({ name: 'senseId', type: () => String, defaultValue: '' })
    senseId: string
  ): Promise<SenseHydratedDto[]> {
    return this.service.sensesForOxIdCaseInsensitive({
      oxId: oxId,
      senseId: senseId,
      filterForHasSign: filter
    });
  }

  @ResolveField(() => [SignDto])
  signs(@Root() ss: SenseHydratedDto) {
    return this.service.getSignsByAssociation(ss.senseId);
  }
}

@Resolver(() => SenseSignForwardDto)
export class SenseSignsForwardResolver {
  constructor(private readonly service: ReferenceService) {}

  @Query(() => [SenseSignForwardDto], { name: 'senseSigns' })
  getSigns(@Args('senseId') senseId: string): Promise<SenseSignForwardDto[]> {
    return this.service.getSenseSigns({ senseId: senseId });
  }

  @ResolveField(() => SignDto)
  sign(@Root() ss: SenseSignForwardDto) {
    return this.service.findOneSign(ss.signId);
  }
}
