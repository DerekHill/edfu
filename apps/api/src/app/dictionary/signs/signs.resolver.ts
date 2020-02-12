import { Resolver, Query, Args, ResolveProperty, Root } from '@nestjs/graphql';
import { SignsService } from './signs.service';
import { SenseSignDto, SignDto } from '@edfu/api-interfaces';

@Resolver(of => SenseSignDto)
export class SignsResolver {
  constructor(private readonly signsService: SignsService) {}

  @Query(returns => [SenseSignDto])
  signs(@Args('senseId') senseId: string): Promise<SenseSignDto[]> {
    return this.signsService.getSenseSigns(senseId);
  }

  @ResolveProperty(returns => SignDto)
  sign(@Root() ss: SenseSignDto) {
    return this.signsService.findOneSign(ss.signId);
  }
}
