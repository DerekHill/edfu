import { Console, Command } from 'nestjs-console';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
// import { BaseSearchesService } from '../oxford-searches/oxford-searches.service';
// import { FixturesService } from './fixtures/fixtures.service';

@Console()
export class EntrypointService {
  constructor(
    private readonly oxfordService: OxfordApiService // private readonly fixturesService: FixturesService
  ) {}

  @Command({
    command: 'works'
  })
  works() {
    console.log('works!');
  }

  @Command({
    command: 'oxfordEntries'
  })
  async oxfordEntries(): Promise<void> {
    const res = await this.oxfordService.getEntries('food');
    console.dir(res, { depth: null });
    process.exit();
  }

  @Command({
    command: 'oxfordThesauruses'
  })
  async oxfordThesauruses(): Promise<void> {
    const res = await this.oxfordService.getThesauruses('fast');
    console.dir(res, { depth: null });
    process.exit();
  }

  // @Command({
  //   command: 'fixtures'
  // })
  // async fixtures() {
  //   try {
  //     await this.fixturesService.create();
  //   } catch (error) {
  //     console.error(error);
  //   }

  //   process.exit();
}
