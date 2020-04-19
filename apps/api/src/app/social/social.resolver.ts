import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { LikeDto } from './likes/dto/like.dto';
import { LikesService } from './likes/likes.service';
import { FindLikeArgs } from './likes/dto/find-like.args';
import { ManageLikeArgs } from './likes/dto/manage-like.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUserGraphQL } from '../common/decorators/current-user.decorator';
import { BasicUser } from '@edfu/api-interfaces';
import { UsersService } from '../users/users.service';

@Resolver(of => LikeDto)
export class SocialResolver {
  constructor(
    private readonly service: LikesService,
    private readonly usersService: UsersService
  ) {}

  @Query(returns => [LikeDto], { name: 'likes' })
  getLikes(@Args() args: FindLikeArgs): Promise<LikeDto[]> {
    return this.service.find(args);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => [LikeDto])
  async createLikes(
    @CurrentUserGraphQL() user: BasicUser,
    @Args() args: ManageLikeArgs
  ) {
    const fullUser = await this.usersService.findByEmail(user.email);
    await this.service.create({ ...args, ...{ userId: fullUser._id } });
    return this.service.find({ signId: args.signId });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => [LikeDto])
  async removeLikes(
    @CurrentUserGraphQL() user: BasicUser,
    @Args() args: ManageLikeArgs
  ) {
    const fullUser = await this.usersService.findByEmail(user.email);
    await this.service.remove({ ...args, ...{ userId: fullUser._id } });
    return this.service.find({ signId: args.signId });
  }
}
