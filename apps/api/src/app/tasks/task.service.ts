import { Console, Command } from 'nestjs-console';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
import { FixturesService } from './fixtures/fixtures.service';
import { LoaderService } from './loader/loader.service';

@Console()
export class TaskService {
  constructor(
    private readonly oxfordService: OxfordApiService,
    private readonly fixturesService: FixturesService,
    private readonly loaderService: LoaderService
  ) {}

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

  @Command({
    command: 'fixtures'
  })
  async fixtures() {
    try {
      await this.fixturesService.create();
    } catch (error) {
      console.error(error);
    }
    process.exit();
  }

  @Command({
    command: 'load'
  })
  async load() {
    try {
      await this.loaderService.load();
    } catch (error) {
      console.error(error);
    }
    process.exit();
  }

  @Command({
    command: 'print'
  })
  async printSenses() {
    console.log('printing');
    await this.loaderService.printSenses();
    process.exit();
  }
}
