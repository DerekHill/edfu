import { EntriesService } from './entries.service';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { TestingModule, Test } from '@nestjs/testing';
import { TestDatabaseModule } from '../../config/test-database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ENTRY_COLLECTION_NAME, SENSE_COLLECTION_NAME } from '../../constants';
import { EntrySchema } from './schemas/entry.schema';
import { SenseSchema } from '../senses/schemas/sense.schema';
import { SensesService } from '../senses/senses.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';

class OxfordSearchesServiceLocalMock {
  findOrFetch(): Promise<OxfordSearchRecord[]> {
    return Promise.resolve(null);
  }
}

describe('EntriesService', () => {
  let entriesService: EntriesService;
  let entrySearchesService: EntrySearchesService;
  let thesaurusSearchesService: ThesaurusSearchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_COLLECTION_NAME, schema: EntrySchema }
        ]),
        MongooseModule.forFeature([
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
        ])
      ],
      providers: [
        EntriesService,
        SensesService,
        {
          provide: EntrySearchesService,
          useClass: OxfordSearchesServiceLocalMock
        },
        {
          provide: ThesaurusSearchesService,
          useClass: OxfordSearchesServiceLocalMock
        }
      ]
    }).compile();

    entriesService = module.get<EntriesService>(EntriesService);
    entrySearchesService = module.get<EntrySearchesService>(
      EntrySearchesService
    );
    thesaurusSearchesService = module.get<ThesaurusSearchesService>(
      ThesaurusSearchesService
    );
  });

  describe('findOrCreateWithOwnSensesOnly() from Dictionary', () => {
    it('returns new record if word does not already exist', () => {
      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(chars => null);

      entriesService.findOrCreateWithOwnSensesOnly('foo');
    });
    it.skip('returns existing record if word does already exist', () => {});
  });
});