import { Resolver, Query, Args, ResolveProperty, Root } from '@nestjs/graphql';
import { ReferenceService } from './reference.service';
import { SenseForEntryDto } from './senses/dto/sense.dto';
import { SenseSignDto } from './signs/dto/sense-sign.dto';
import { SignDto } from './signs/dto/sign.dto';
import { ObjectId } from 'bson';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BasicUser } from '@edfu/api-interfaces';

@Resolver(of => SenseForEntryDto)
export class DictionaryResolver {
  constructor(private readonly service: ReferenceService) {}

  @Query(returns => [String], { name: 'oxIds' })
  getOxIds(
    @Args('searchString') searchString: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean
  ): Promise<string[]> {
    return this.service.searchOxIds(searchString, filter);
  }

  @Query(returns => [SenseForEntryDto], { name: 'senses' })
  getSensesFromExisting(
    @Args('oxId') oxId: string,
    @Args({ name: 'filter', type: () => Boolean, defaultValue: false })
    filter: boolean,
    @Args({ name: 'senseId', type: () => String, defaultValue: '' })
    senseId: string
  ): Promise<SenseForEntryDto[]> {
    return this.service.getSensesForOxIdCaseInsensitive(oxId, filter, senseId);
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

@Resolver('Test')
export class TestResolver {
  @Query(returns => SignDto)
  getTestSign(): Promise<SignDto> {
    return Promise.resolve({
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'remember me',
      mediaUrl: 'www.com',
      s3Key: '1234.mp4'
    });
  }

  @Query(returns => SignDto)
  @UseGuards(GqlAuthGuard)
  getAuthenticatedTestSign(@CurrentUser() user: BasicUser): Promise<SignDto> {
    return Promise.resolve({
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: user.email,
      mediaUrl: 'www.com',
      s3Key: '1234.mp4'
    });
  }
}
