import { Console, Command } from 'nestjs-console';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
import { FixturesService } from './fixtures/fixtures.service';
import { LoaderService } from './loader/loader.service';
import { MigrateService } from './migrate/migrate.service';

@Console()
export class TaskService {
  constructor(
    private readonly oxfordService: OxfordApiService,
    private readonly fixturesService: FixturesService,
    private readonly loaderService: LoaderService,
    private readonly migrateService: MigrateService
  ) {}

  @Command({
    command: 'migrate <filename>'
  })
  async migrate(filename: string) {
    await this.migrateService.up(filename);
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
    command: 'load1'
  })
  async load1() {
    const words_1 = [
      'good morning',
      'good afternoon',
      'help',
      'more',
      'please',
      'thank you',
      'break',
      'bad',
      'begin',
      'good',
      'goodbye',
      'happy',
      'hello',
      'look',
      'no',
      'sad',
      'slow',
      'stop',
      'toilet',
      'yes'
    ];
    try {
      await this.loaderService.load(words_1);
    } catch (error) {
      console.error(error);
    }
    process.exit();
  }

  @Command({
    command: 'load2'
  })
  async load2() {
    const words = [
      'playground',
      'slide',
      'penguin',
      'tree',
      'grass',
      'pancake',
      'rain',
      'summer'
    ];
    try {
      await this.loaderService.load(words);
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
