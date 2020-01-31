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
import {
  createEntrySearchRecord,
  createThesaurusSearchRecord
} from './test/oxford-search-record-factory';
import { DictionarySenseRecord } from '../senses/interfaces/sense.interface';
import { HeadwordOrPhrase } from '../../enums';

class OxfordSearchesServiceMock {
  findOrFetch(): Promise<OxfordSearchRecord[]> {
    return Promise.resolve(null);
  }
}

class SensesServiceMock {
  findOrCreateDictionarySenseWithAssociation(): Promise<DictionarySenseRecord> {
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
          useClass: OxfordSearchesServiceMock
        },
        {
          provide: ThesaurusSearchesService,
          useClass: OxfordSearchesServiceMock
        },
        {
          provide: SensesService,
          useClass: SensesServiceMock
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
    it('returns new record if word does not already exist', async () => {
      const WORD = 'food';
      const TYPE = HeadwordOrPhrase.headword;
      const record = createEntrySearchRecord(WORD, true, 1, TYPE);
      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([record]));

      const res = await entriesService.findOrCreateWithOwnSensesOnly(WORD);
      expect(res[0].word).toEqual(WORD);
      expect(res[0].headwordOrPhrase).toEqual(TYPE);
    });
  });

  describe('addRelatedEntries', () => {
    it('throws error if entry does not exist', async () => {
      expect.assertions(1);
      try {
        await entriesService.addRelatedEntries('food', 1);
      } catch (e) {
        expect(e.message).toMatch(/not found/);
      }
    });

    it.only('works', async () => {
      //   expect.assertions(1);
      const WORD = 'food';
      const dictionaryRecord = createEntrySearchRecord(WORD);
      const thesaurusRecord = createThesaurusSearchRecord(WORD, ['supper']);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([dictionaryRecord]));

      jest
        .spyOn(thesaurusSearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([thesaurusRecord]));

      const res = await entriesService.findOrCreateWithOwnSensesOnly(WORD);
      console.log(res);
      await entriesService.addRelatedEntries('food', 1);
    });
  });

  describe('filterResultsByHomographC', () => {
    it('filters for correct result', () => {
      const HOMOGRAPH_C = 1;
      const WORD_1 = 'word_1';
      const thesaurusRecord1 = createThesaurusSearchRecord(
        WORD_1,
        [],
        true,
        HOMOGRAPH_C
      );
      const thesaurusRecord2 = createThesaurusSearchRecord(
        'word2',
        [],
        true,
        2
      );
      const res: OxfordSearchRecord = entriesService.filterResultsByHomographC(
        [thesaurusRecord1, thesaurusRecord2],
        HOMOGRAPH_C
      );
      expect(res.homographC).toBe(HOMOGRAPH_C);
      expect(res.normalizedSearchTerm).toBe(WORD_1);
    });

    it('works if homographC is null', () => {
      const HOMOGRAPH_C = null;
      const WORD_1 = 'word_1';
      const thesaurusRecord = createThesaurusSearchRecord(
        WORD_1,
        [],
        true,
        HOMOGRAPH_C
      );
      const res: OxfordSearchRecord = entriesService.filterResultsByHomographC(
        [thesaurusRecord],
        HOMOGRAPH_C
      );
      expect(res.normalizedSearchTerm).toBe(WORD_1);
    });

    it('returns null if null is supplied', () => {
      const res: OxfordSearchRecord = entriesService.filterResultsByHomographC(
        null,
        null
      );
      expect(res).toBeNull();
    });

    it('returns null if empty array is supplied', () => {
      const res: OxfordSearchRecord = entriesService.filterResultsByHomographC(
        [],
        null
      );
      expect(res).toBeNull();
    });
  });
});
