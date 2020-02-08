import { Test, TestingModule } from '@nestjs/testing';
import {
  BaseSearchesService,
  ThesaurusSearchesService,
  EntrySearchesService
} from './oxford-searches.service';
import { ConfigModule } from '../config/config.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_SEARCH_COLLECTION_NAME,
  THESAURUS_SEARCH_COLLECTION_NAME
} from '../constants';
import { TestDatabaseModule } from '../config/test-database.module';
import {
  RESULT_WITH_HOMOGRAPH_NUMBER_200,
  RESULT_WITHOUT_HOMOGRAPH_NUMBER,
  MORE_RESULT_LANGUAGE
} from './test/sample-responses';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
import { OxfordSearchSchema } from './schemas/oxford-search.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { OxfordSearchDocument } from './interfaces/oxford-search.interface';
import { OxResult } from '../oxford-api/interfaces/oxford-api.interface';

const CHIPS = ['chips'];

const createOxResult = (id: string): OxResult => {
  return {
    id: id,
    language: 'en',
    lexicalEntries: [],
    type: 'headword',
    word: id
  };
};

@Injectable()
class OxfordSearchesTestSetupService {
  constructor(
    @InjectModel(ENTRY_SEARCH_COLLECTION_NAME)
    private readonly searchModel: Model<OxfordSearchDocument>
  ) {}

  async count(oxIdOrSearchTermLowercase: string, homographC: number) {
    return await this.searchModel.countDocuments({
      oxIdOrSearchTermLowercase: oxIdOrSearchTermLowercase,
      homographC: homographC
    });
  }
}

class OxfordServiceMock {
  getEntries(searchTerm: string) {
    return CHIPS;
  }
}

describe('BaseSearchesService', () => {
  let bss: BaseSearchesService;
  let setupService: OxfordSearchesTestSetupService;

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
        },
        OxfordSearchesTestSetupService
      ]
    }).compile();

    bss = app.get<BaseSearchesService>(BaseSearchesService);
    setupService = app.get<OxfordSearchesTestSetupService>(
      OxfordSearchesTestSetupService
    );
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

  describe('extractOxIdOrSearchTermLowercase()', () => {
    it('extracts oxId if exists keeping capitalisation', () => {
      const SEARCH_TERM = 'more';
      expect(
        bss.extractOxIdOrSearchTermLowercase(SEARCH_TERM, MORE_RESULT_LANGUAGE)
      ).toEqual('More');
    });

    it('uses search term if result is null, making it lowercase', () => {
      const SEARCH_TERM = 'Orange juice';
      expect(bss.extractOxIdOrSearchTermLowercase(SEARCH_TERM, null)).toEqual(
        'orange juice'
      );
    });
  });
});

describe('EntrySearchesService', () => {
  let ess: EntrySearchesService;
  let setupService: OxfordSearchesTestSetupService;

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
        },
        OxfordSearchesTestSetupService
      ]
    }).compile();

    ess = app.get<EntrySearchesService>(EntrySearchesService);
    setupService = app.get<OxfordSearchesTestSetupService>(
      OxfordSearchesTestSetupService
    );
  });

  describe('unduplicated saving', () => {
    it('does not save the same word twice', async () => {
      const oxId = 'Orange';
      const homographC = 0;
      const one = 1;
      const result = createOxResult(oxId);
      await ess.findOrCreateFromResult(oxId, result);
      await expect(setupService.count(oxId, homographC)).resolves.toEqual(one);
      await ess.findOrCreateFromResult(oxId, result);
      await expect(setupService.count(oxId, homographC)).resolves.toEqual(one);
    });
  });

  describe('findOrFetch()', () => {
    it('returns existing record if already exists', async () => {
      const searchTerm = 'cheese';
      const existing = await ess.findOrCreateFromResult(
        searchTerm,
        createOxResult(searchTerm)
      );
      const fromFindOrCreate = await ess.findOrFetch(searchTerm);
      expect(existing._id).toEqual(fromFindOrCreate[0]._id);
    });

    it('finds in case insensitive way', async () => {
      const oxId = 'Orange';
      const searchTerm = 'orange';
      const existing = await ess.findOrCreateFromResult(
        oxId,
        createOxResult(oxId)
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
