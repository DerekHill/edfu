import { Resolver, Query, Args, ResolveProperty, Root } from '@nestjs/graphql';
import { SignsService } from './signs.service';
import { SenseSignDto } from './dto/sense-sign.dto';
import { SignDto } from './dto/sign.dto';

@Resolver(of => SenseSignDto)
// @Resolver('Signs')
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
