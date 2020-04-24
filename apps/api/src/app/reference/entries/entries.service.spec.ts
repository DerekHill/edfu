import { ObjectId } from 'bson';
import { EntriesService } from './entries.service';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { TestingModule, Test } from '@nestjs/testing';
import { TestDatabaseModule } from '../../config/test-database.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  OXFORD_API_QUEUE_NAME
} from '../../constants';
import { EntrySchema } from './schemas/entry.schema';
import { SenseSchema } from '../senses/schemas/sense.schema';
import { SensesService } from '../senses/senses.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import {
  createEntrySearchRecord,
  createThesaurusSearchRecord
} from './test/oxford-search-record-factory';
import {
  DictionaryOrThesaurus,
  LexicalCategory,
  HeadwordOrPhrase,
  EntryDocument,
  EntryRecord,
  EntrySenseRecord,
  DictionarySenseRecord,
  ThesaurusSenseRecord,
  LinkedSensePairing
} from '@edfu/api-interfaces';
import { EntrySensesService } from '../entry-senses/entry-senses.service';
import { SimilarityService } from '../similarity/similarity.service';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BullModule } from '@nestjs/bull';

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

class SimilarityServiceMock {
  getSimilarity(sentence1: string, sentence2: string): Promise<number> {
    return Promise.resolve(null);
  }
}

@Injectable()
export class EntriesTestSetupService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>
  ) {}

  createEntry(entry: EntryRecord): Promise<EntryRecord> {
    return this.entryModel.create(entry);
  }

  findEntry(_id: any): Promise<EntryRecord> {
    return this.entryModel.findById(_id).exec();
  }
}

describe('EntriesService', () => {
  let entriesService: EntriesService;
  let entrySearchesService: EntrySearchesService;
  let thesaurusSearchesService: ThesaurusSearchesService;
  let sensesService: SensesService;
  let entrySensesService: EntrySensesService;
  let similarityService: SimilarityService;
  let setupService: EntriesTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
        ]),
        BullModule.registerQueue({
          name: OXFORD_API_QUEUE_NAME,
          redis: process.env.REDIS_URL
        })
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
        },
        {
          provide: SimilarityService,
          useClass: SimilarityServiceMock
        },
        EntriesTestSetupService
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
    similarityService = module.get<SimilarityService>(SimilarityService);
    setupService = module.get<EntriesTestSetupService>(EntriesTestSetupService);
  });

  describe('findOrCreateWithOwnSensesOnly() from Dictionary', () => {
    it('returns new record if word does not already exist', async () => {
      const WORD = 'food';
      const TYPE = HeadwordOrPhrase.headword;
      const record = createEntrySearchRecord(WORD, 1, TYPE);
      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([record]));

      const res = await entriesService.findOrCreateWithOwnSensesOnly(
        WORD,
        false
      );
      expect(res[0].word).toEqual(WORD);
      expect(res[0].headwordOrPhrase).toEqual(TYPE);
    });

    it('searches for existing records in case-insensitive way', async () => {
      const lowercaseWord = 'orange';
      const TYPE = HeadwordOrPhrase.headword;
      const uppercaseRecord = createEntrySearchRecord('Orange', 1, TYPE);
      const lowerCaseRecord = createEntrySearchRecord(lowercaseWord, 1, TYPE);

      await entriesService._findOrCreateEntryFromSearchRecord(uppercaseRecord);
      await entriesService._findOrCreateEntryFromSearchRecord(lowerCaseRecord);

      const res = await entriesService.findOrCreateWithOwnSensesOnly(
        lowercaseWord,
        false
      );
      expect(res.length).toBe(2);
    });
  });

  describe('addRelatedEntries()', () => {
    it('throws error if entry does not exist', async () => {
      expect.assertions(1);
      try {
        await entriesService.addRelatedEntries(
          { oxId: 'food', homographC: 1 },
          false
        );
      } catch (e) {
        expect(e.message).toMatch(/not found/);
      }
    });

    it('adds entries for thesaurus synonyms', async () => {
      const WORD = 'food';
      const thesaurusSearchRecord = createThesaurusSearchRecord(WORD, [
        'supper'
      ]);
      const THESAURUS_SENSE_ID = 'thesaurus_sense_id';
      const ENTRY_OXID = 'ownEntryOxId';
      const ENTRY_HOMOGRAPH_C = 1;
      const SYNONYMS = ['jump', 'leap'];

      const thesaurusSense: ThesaurusSenseRecord = {
        _id: new ObjectId(),
        ownEntryOxId: ENTRY_OXID,
        ownEntryHomographC: ENTRY_HOMOGRAPH_C,
        dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
        lexicalCategory: LexicalCategory.noun,
        apiSenseIndex: 0,
        senseId: THESAURUS_SENSE_ID,
        example: 'example of sense',
        synonyms: SYNONYMS
      };

      const dictionarySense: DictionarySenseRecord = {
        _id: new ObjectId(),
        ownEntryOxId: ENTRY_OXID,
        ownEntryHomographC: ENTRY_HOMOGRAPH_C,
        dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
        lexicalCategory: LexicalCategory.noun,
        apiSenseIndex: 0,
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
          (ownEntryOxId, ownEntryHomographC, lexicalCategory, oxSense) => {
            return Promise.resolve(thesaurusSense);
          }
        );

      await entriesService.findOrCreateWithOwnSensesOnly(WORD, false);

      const entries = await entriesService.addRelatedEntries(
        {
          oxId: 'food',
          homographC: 1
        },
        false
      );

      expect(entries.map(entry => entry.word).sort()).toEqual(SYNONYMS.sort());
    });

    it('does not add related entries if relatedEntriesAdded is true', async () => {
      const OXID = 'food';
      const entryData = {
        _id: new ObjectId(),
        oxId: OXID,
        homographC: 0,
        word: OXID,
        relatedEntriesAdded: true,
        headwordOrPhrase: HeadwordOrPhrase.headword
      };

      const entry = await setupService.createEntry(entryData);
      const res = await entriesService.addRelatedEntries(
        {
          oxId: entry.oxId,
          homographC: entry.homographC
        },
        false
      );
      expect(res[0].oxId).toBe(OXID);
    });

    it('sets relatedEntriesAdded to true when related entries are added', async () => {
      const OXID = 'food';
      const HOMOGRAPH_C = 0;
      const entryData = {
        _id: new ObjectId(),
        oxId: OXID,
        homographC: HOMOGRAPH_C,
        word: OXID,
        relatedEntriesAdded: false,
        headwordOrPhrase: HeadwordOrPhrase.headword
      };

      const blankThesaurusSearchResult = {
        _id: new ObjectId(),
        oxIdOrSearchTermLowercase: OXID,
        result: null,
        homographC: HOMOGRAPH_C
      };

      jest
        .spyOn(thesaurusSearchesService, 'findOrFetch')
        .mockImplementation(chars =>
          Promise.resolve([blankThesaurusSearchResult])
        );

      const entry = await setupService.createEntry(entryData);
      await entriesService.addRelatedEntries(
        {
          oxId: OXID,
          homographC: HOMOGRAPH_C
        },
        false
      );
      const updatedEntry = await setupService.findEntry(entry._id);
      expect(updatedEntry.relatedEntriesAdded).toBeTruthy();
    });
  });

  describe('filterResultsByHomographC()', () => {
    it('filters for correct result', () => {
      const HOMOGRAPH_C = 1;
      const WORD_1 = 'word_1';
      const thesaurusRecord1 = createThesaurusSearchRecord(
        WORD_1,
        [],
        HOMOGRAPH_C
      );
      const thesaurusRecord2 = createThesaurusSearchRecord('word2', [], 2);
      const res: OxfordSearchRecord = entriesService._filterResultsByHomographC(
        [thesaurusRecord1, thesaurusRecord2],
        HOMOGRAPH_C
      );
      expect(res.homographC).toBe(HOMOGRAPH_C);
      expect(res.oxIdOrSearchTermLowercase).toBe(WORD_1);
    });

    it('works if homographC is null', () => {
      const HOMOGRAPH_C = null;
      const WORD_1 = 'word_1';
      const thesaurusRecord = createThesaurusSearchRecord(
        WORD_1,
        [],
        HOMOGRAPH_C
      );
      const res: OxfordSearchRecord = entriesService._filterResultsByHomographC(
        [thesaurusRecord],
        HOMOGRAPH_C
      );
      expect(res.oxIdOrSearchTermLowercase).toBe(WORD_1);
    });

    it('returns null if null is supplied', () => {
      const res: OxfordSearchRecord = entriesService._filterResultsByHomographC(
        null,
        null
      );
      expect(res).toBeNull();
    });

    it('returns null if empty array is supplied', () => {
      const res: OxfordSearchRecord = entriesService._filterResultsByHomographC(
        [],
        null
      );
      expect(res).toBeNull();
    });
  });

  describe('findOrCreateEntryFromSearchRecord()', () => {
    it('creates basic entry', async () => {
      const WORD = 'river';
      const record: OxfordSearchRecord = createEntrySearchRecord(WORD);
      const origWord = await entriesService._findOrCreateEntryFromSearchRecord(
        record
      );
      expect(origWord.oxId).toEqual(WORD);
    });
  });

  describe('findOrCreateSynonymEntryAndAssociations()', () => {
    it('adds similarity to association', async () => {
      expect.assertions(1);
      const synonymOxId = 'speedy';
      const synonymHomographC = 0;
      const dictionarySenseId = 'dictionarySenseId';

      const dictionarySense: DictionarySenseRecord = {
        _id: new ObjectId(),
        ownEntryOxId: 'fast',
        ownEntryHomographC: 1,
        dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
        lexicalCategory: LexicalCategory.adjective,
        apiSenseIndex: 0,
        senseId: dictionarySenseId,
        example: 'a fast sports car',
        definition: '',
        thesaurusSenseIds: []
      };
      const thesaurusSenseLexicalCategory = LexicalCategory.adjective;
      const thesaurusSenseExample = 'a speedy winger';

      const entrySearchRecord = createEntrySearchRecord(
        synonymOxId,
        synonymHomographC,
        HeadwordOrPhrase.headword
      );

      const SIMILARITY = 0.3;

      const entrySenseRecord: EntrySenseRecord = {
        _id: new ObjectId(),
        oxId: synonymOxId,
        homographC: synonymHomographC,
        senseId: dictionarySenseId,
        associationType: DictionaryOrThesaurus.thesaurus,
        similarity: SIMILARITY
      };

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(chars => Promise.resolve([entrySearchRecord]));

      jest
        .spyOn(similarityService, 'getSimilarity')
        .mockImplementation(chars => Promise.resolve(SIMILARITY));

      jest
        .spyOn(entrySensesService, 'findOrCreate')
        .mockImplementation(
          (oxId, homographC, senseId, dictionaryOrThesaurus, similarity) => {
            expect(similarity).toBe(SIMILARITY);
            return Promise.resolve(entrySenseRecord);
          }
        );

      await entriesService._findOrCreateSynonymEntryAndAssociations(
        dictionarySense,
        synonymOxId,
        thesaurusSenseLexicalCategory,
        thesaurusSenseExample,
        false
      );
    });
  });
});
