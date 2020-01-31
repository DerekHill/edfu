import { ObjectId } from 'bson';
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
import {
  DictionarySenseRecord,
  ThesaurusSenseRecord,
  LinkedSensePairing
} from '../senses/interfaces/sense.interface';
import { HeadwordOrPhrase } from '../../enums';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';
import { EntrySenseRecord } from '../entry-senses/interfaces/entry-sense.interface';
import { EntrySensesService } from '../entry-senses/entry-senses.service';

class OxfordSearchesServiceMock {
  findOrFetch(): Promise<OxfordSearchRecord[]> {
    return Promise.resolve(null);
  }
}

class SensesServiceMock {
  findOrCreateDictionarySenseWithAssociation(): Promise<DictionarySenseRecord> {
    return Promise.resolve(null);
  }

  findOrCreateThesaurusSenseWithoutAssociation(): Promise<
    ThesaurusSenseRecord
  > {
    return Promise.resolve(null);
  }

  populateThesaurusLinkedSenses(): Promise<LinkedSensePairing> {
    return Promise.resolve(null);
  }
}

class EntrySensesServiceMock {
  findOrCreate(): Promise<EntrySenseRecord> {
    return Promise.resolve(null);
  }
}

describe('EntriesService', () => {
  let entriesService: EntriesService;
  let entrySearchesService: EntrySearchesService;
  let thesaurusSearchesService: ThesaurusSearchesService;
  let sensesService: SensesService;
  let entrySensesService: EntrySensesService;

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
        },
        {
          provide: EntrySensesService,
          useClass: EntrySensesServiceMock
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
    sensesService = module.get<SensesService>(SensesService);
    entrySensesService = module.get<EntrySensesService>(EntrySensesService);
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
      const WORD = 'food';
      const thesaurusSearchRecord = createThesaurusSearchRecord(WORD, [
        'supper'
      ]);
      const THESAURUS_SENSE_ID = 'thesaurus_sense_id';
      const ENTRY_OXID = 'entryOxId';
      const ENTRY_HOMOGRAPH_C = 1;
      const SYNONYMS = ['jump', 'leap'];

      const thesaurusSense: ThesaurusSenseRecord = {
        _id: new ObjectId(),
        entryOxId: ENTRY_OXID,
        entryHomographC: ENTRY_HOMOGRAPH_C,
        dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
        lexicalCategory: LexicalCategory.noun,
        senseId: THESAURUS_SENSE_ID,
        example: 'example of sense',
        synonyms: SYNONYMS
      };

      const dictionarySense: DictionarySenseRecord = {
        _id: new ObjectId(),
        entryOxId: ENTRY_OXID,
        entryHomographC: ENTRY_HOMOGRAPH_C,
        dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
        lexicalCategory: LexicalCategory.noun,
        thesaurusSenseIds: [THESAURUS_SENSE_ID],
        definition: '',
        example: '',
        senseId: 'dictionary_sense_id'
      };

      const linkedSensePairing: LinkedSensePairing = {
        thesaurusSense: thesaurusSense,
        dictionarySenses: [dictionarySense]
      };

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(searchTerm =>
          Promise.resolve([createEntrySearchRecord(searchTerm)])
        );

      jest
        .spyOn(thesaurusSearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([thesaurusSearchRecord]));

      jest
        .spyOn(sensesService, 'populateThesaurusLinkedSenses')
        .mockImplementation(() => {
          return Promise.resolve(linkedSensePairing);
        });

      jest
        .spyOn(sensesService, 'findOrCreateThesaurusSenseWithoutAssociation')
        .mockImplementation(
          (entryOxId, entryHomographC, lexicalCategory, oxSense) => {
            return Promise.resolve(thesaurusSense);
          }
        );

      await entriesService.findOrCreateWithOwnSensesOnly(WORD);

      const entries = await entriesService.addRelatedEntries('food', 1);

      expect(entries.map(entry => entry.word).sort()).toEqual(SYNONYMS.sort());
    });

    it.skip('finds related entries if synonyms contain spaces', () => {});
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
