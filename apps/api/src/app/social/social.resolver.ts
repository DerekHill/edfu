import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { LikeDto } from './likes/dto/like.dto';
import { LikesService } from './likes/likes.service';
import { FindLikeArgs } from './likes/dto/find-like.args';
import { ManageLikeArgs } from './likes/dto/manage-like.args';
import { UseGuards } from '@nestjs/common';
import { GqlPassportAuthGuard } from '../auth/guards/gql-passport.auth.guard';
import { CurrentUserGraphQL } from '../common/decorators/current-user.decorator';
import { BasicUser } from '@edfu/api-interfaces';
import { GqlHydrateUserAuthGuard } from '../auth/guards/gql-hydrate-user-auth.guard';

@Resolver(of => LikeDto)
export class SocialResolver {
  constructor(private readonly service: LikesService) {}

  @Query(returns => [LikeDto], { name: 'likes' })
  getLikes(@Args() args: FindLikeArgs): Promise<LikeDto[]> {
    return this.service.find(args);
  }

  @UseGuards(GqlHydrateUserAuthGuard)
  @UseGuards(GqlPassportAuthGuard)
  @Mutation(returns => [LikeDto])
  async createLikes(
    @CurrentUserGraphQL() user: BasicUser,
    @Args() args: ManageLikeArgs
  ) {
    await this.service.create({ ...args, ...{ userId: user._id } });
    return this.service.find({ signId: args.signId });
  }

  @UseGuards(GqlHydrateUserAuthGuard)
  @UseGuards(GqlPassportAuthGuard)
  @Mutation(returns => [LikeDto])
  async removeLikes(
    @CurrentUserGraphQL() user: BasicUser,
    @Args() args: ManageLikeArgs
  ) {
    await this.service.remove({ ...args, ...{ userId: user._id } });
    return this.service.find({ signId: args.signId });
  }
}
