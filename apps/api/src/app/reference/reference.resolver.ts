import { Resolver, Query, Args, ResolveProperty, Root } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { SenseSignDto } from './signs/dto/sense-sign.dto';
import { SignDto } from './signs/dto/sign.dto';
import { ConfigService } from '@nestjs/config';

@Resolver(of => SenseForEntryDto)
export class DictionaryResolver {
  constructor(
    private readonly service: ReferenceService,
    private config: ConfigService
  ) {}

  @Query(returns => [String], { name: 'oxIds' })
  getOxIds(
    @Args('searchString') searchString: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean
  ): Promise<string[]> {
    console.log(this.config.get('OXFORD_APP_ID'));
    return this.service.searchOxIds(searchString, filter);
  }

  @Query(returns => [SenseForEntryDto], { name: 'senses' })
  getSenses(
    @Args('oxId') oxId: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean
  ): Promise<SenseForEntryDto[]> {
    return this.service.getSensesForOxIdCaseInsensitive(oxId, filter);
  }

  @ResolveProperty(returns => [SignDto])
  async signs(@Root() ss: SenseForEntryDto) {
    return this.service.getSigns(ss.senseId);
  }
}

@Resolver(of => SenseSignDto)
export class SignsResolver {
  constructor(private readonly service: ReferenceService) {}
  @Query(returns => [SenseSignDto], { name: 'signs' })
  getSigns(@Args('senseId') senseId: string): Promise<SenseSignDto[]> {
    return this.service.getSenseSigns(senseId);
  }

  @ResolveProperty(returns => SignDto)
  sign(@Root() ss: SenseSignDto) {
    return this.service.findOneSign(ss.signId);
  }
}
