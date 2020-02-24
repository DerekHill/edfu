import { Resolver, Query, Args, ResolveProperty, Root } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { SenseSignDto } from './signs/dto/sense-sign.dto';
import { SignDto } from './signs/dto/sign.dto';

@Resolver(of => SenseSignDto) // For getSigns.  Maybe better way to organise
export class DictionaryResolver {
  constructor(private readonly service: ReferenceService) {}

  @Query(returns => [String], { name: 'oxIds' })
  getOxIds(@Args('searchString') searchString: string): Promise<string[]> {
    return this.service.searchOxIds(searchString);
  }

  @Query(returns => [SenseForEntryDto], { name: 'senses' })
  getSenses(@Args('oxId') oxId: string): Promise<SenseForEntryDto[]> {
    return this.service.getSensesForOxIdCaseInsensitive(oxId);
  }

  @Query(returns => [SenseSignDto], { name: 'signs' })
  getSigns(@Args('senseId') senseId: string): Promise<SenseSignDto[]> {
    return this.service.getSenseSigns(senseId);
  }

  @ResolveProperty(returns => SignDto)
  sign(@Root() ss: SenseSignDto) {
    return this.service.findOneSign(ss.signId);
  }
}
