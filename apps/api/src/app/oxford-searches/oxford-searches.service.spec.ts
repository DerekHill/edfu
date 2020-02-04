import { Test, TestingModule } from '@nestjs/testing';
import {
  BaseSearchesService,
  ThesaurusSearchesService,
  EntrySearchesService
} from './oxford-searches.service';
import { ConfigModule } from '../config/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_SEARCH_COLLECTION_NAME,
  THESAURUS_SEARCH_COLLECTION_NAME
} from '../constants';
import { TestDatabaseModule } from '../config/test-database.module';
import {
  RESULT_WITH_HOMOGRAPH_NUMBER_200,
  RESULT_WITHOUT_HOMOGRAPH_NUMBER
} from './test/sample-responses';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
import { OxfordSearchSchema } from './schemas/oxford-search.schema';

const CHIPS = ['chips'];

class OxfordServiceMock {
  getEntries(searchTerm: string) {
    return CHIPS;
  }
}

describe('BaseSearchesService', () => {
  let bss: BaseSearchesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_SEARCH_COLLECTION_NAME, schema: OxfordSearchSchema }
        ])
      ],
      controllers: [],
      providers: [
        BaseSearchesService,
        EntrySearchesService,
        {
          provide: OxfordApiService,
          useClass: OxfordServiceMock
        }
      ]
    }).compile();

    bss = app.get<BaseSearchesService>(BaseSearchesService);
  });

  describe('homographC extraction', () => {
    it('returns null if no homographNumber is given', () => {
      expect(bss.extractHomographC(RESULT_WITHOUT_HOMOGRAPH_NUMBER)).toBe(0);
    });
    it('returns the number if given', () => {
      expect(bss.extractHomographC(RESULT_WITH_HOMOGRAPH_NUMBER_200)).toEqual(
        2
      );
    });
  });
});

describe('EntrySearchesService', () => {
  let ess: EntrySearchesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_SEARCH_COLLECTION_NAME, schema: OxfordSearchSchema }
        ])
      ],
      controllers: [],
      providers: [
        EntrySearchesService,
        {
          provide: OxfordApiService,
          useClass: OxfordServiceMock
        }
      ]
    }).compile();

    ess = app.get<EntrySearchesService>(EntrySearchesService);
  });

  describe('unduplicated saving', () => {
    it('does not save the same word twice', async () => {
      const word = 'foo';
      const homographC = 0;
      const one = 1;
      await ess.createFromResult(word, RESULT_WITHOUT_HOMOGRAPH_NUMBER);
      await expect(ess.count(word, homographC)).resolves.toEqual(one);
      await ess.createFromResult(word, RESULT_WITHOUT_HOMOGRAPH_NUMBER);
      await expect(ess.count(word, homographC)).resolves.toEqual(one);
    });
  });

  describe('findOrCreate', () => {
    it('returns existing record if already exists', async () => {
      const searchTerm = 'cheese';
      const existing = await ess.createFromResult(
        searchTerm,
        RESULT_WITHOUT_HOMOGRAPH_NUMBER
      );
      const fromFindOrCreate = await ess.findOrFetch(searchTerm);
      expect(existing._id).toEqual(fromFindOrCreate[0]._id);
    });
  });
});

describe('ThesaurusSearchesService', () => {
  let tss: ThesaurusSearchesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TestDatabaseModule,
        MongooseModule.forFeature([
          {
            name: THESAURUS_SEARCH_COLLECTION_NAME,
            schema: OxfordSearchSchema
          }
        ])
      ],
      controllers: [],
      providers: [
        ThesaurusSearchesService,
        {
          provide: OxfordApiService,
          useClass: OxfordServiceMock
        }
      ]
    }).compile();

    tss = app.get<ThesaurusSearchesService>(ThesaurusSearchesService);

    expect(tss).toBeDefined();
  });
});
