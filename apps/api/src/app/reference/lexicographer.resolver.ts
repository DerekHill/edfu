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
import { InjectQueue } from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME } from '../constants';
import { Queue } from 'bull';
import { TranscodeJobData } from '../transcoding/interfaces/transcode-job-data.interface';

@Resolver('Lexicographer')
@UseGuards(GqlAuthGuard)
export class LexicographerResolver {
  constructor(
    private readonly referenceService: ReferenceService,
    private readonly entriesService: EntriesService,
    private readonly signsService: SignsService,
    private readonly usersService: UsersService,
    @InjectQueue(TRANSCODE_QUEUE_NAME)
    private transcodeQueue: Queue<TranscodeJobData>
  ) {}

  @Query(returns => [SenseForEntryDto], { name: 'sensesFromApi' })
  async getSensesFromApi(
    @Args('searchString') searchString: string
  ): Promise<SenseForEntryDto[]> {
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

  @Mutation(returns => SignDto)
  async createSignWithAssociations(
    @CurrentUser() user: BasicUser,
    @Args('createSignData') createSignData: CreateSignInput
  ) {
    //   Might be better way to do validation, but not so clear in docs https://github.com/nestjs/graphql/issues/102
    if (!createSignData.senseIds.length) {
      throw new Error('No senseIds supplied');
    }
    const fullUser = await this.usersService.findByEmail(user.email);
    const sign = await this.signsService.createSignWithAssociations(
      fullUser._id,
      createSignData
    );
    const job = await this.transcodeQueue.add({
      s3KeyOrig: createSignData.s3KeyOrig
    });
    return sign;
  }
}
