import { Test, TestingModule } from '@nestjs/testing';
import { EntriesService } from './entries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EntrySchema } from './schemas/entry.schema';
import { ENTRY_COLLECTION_NAME, SENSE_COLLECTION_NAME } from '../../constants';
import { TestDatabaseModule } from '../../config/test-database.module';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import { ObjectId } from 'bson';
import { SensesService } from '../senses/senses.service';
import { SenseSchema } from '../senses/schemas/sense.schema';
import { OxfordSearchesServiceOutdatedMock } from '../../oxford-searches/test/oxford-searches.service.mock';
import {
  createEntrySearchRecord,
  createThesaurusSearchRecord
} from './test/oxford-search-record-factory';

describe.skip('OldEntriesService', () => {
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
          useClass: OxfordSearchesServiceOutdatedMock
        },
        {
          provide: ThesaurusSearchesService,
          useClass: OxfordSearchesServiceOutdatedMock
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

  describe('createEntry', () => {
    it('creates basic entry', async () => {
      const record: OxfordSearchRecord = createEntrySearchRecord('river');
      const relatedEntriesAdded = true;
      const origWord = await entriesService.createEntryFromSearchRecord(record);
      expect(origWord.relatedEntriesAdded).toBeTruthy();
    });
  });

  describe('findOrCreate', () => {
    it('creates entry if found and adds ownSenseID', async () => {
      const word = 'food';
      const record = createEntrySearchRecord(word);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      const senseId = record.result.lexicalEntries[0].entries[0].senses[0].id;

      const words = await entriesService.findOrCreateAndUpdateSenses(word);
      expect(words[0].word).toEqual(word);
      expect(words[0].ownSenseIds).toEqual(expect.arrayContaining([senseId]));
    });

    it('does not create entry if not found in dictionary', async () => {
      const word = 'xyzxzy';
      const record = createEntrySearchRecord(word, false);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      return expect(
        entriesService.findOrCreateAndUpdateSenses(word)
      ).rejects.toMatchObject({
        message: expect.stringMatching(/not found/)
      });
    });

    it('adds synonymSenseId if entries already existed without it', async () => {
      const word = 'sheep';
      const record = createEntrySearchRecord(word);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      await entriesService.findOrCreateAndUpdateSenses(word);

      const synonymSenseId = 'my_id';

      const words = await entriesService.findOrCreateAndUpdateSenses(
        word,
        false,
        synonymSenseId
      );

      expect(words[0].synonymSenseIds[0]).toEqual(synonymSenseId);
    });

    it('does not update the synonym sense ids if the entry has multiple homonyms', async () => {
      const word = 'jaguar';
      const jaguarCar = createEntrySearchRecord(word, true, 1);
      const jaguarCat = createEntrySearchRecord(word, true, 2);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([jaguarCar, jaguarCat]));

      await entriesService.findOrCreateAndUpdateSenses(word);

      const synonymSenseId = 'my_id';

      const words = await entriesService.findOrCreateAndUpdateSenses(
        word,
        false,
        synonymSenseId
      );

      expect(words[0].synonymSenseIds).toEqual([]);
    });
  });

  describe('createSenses', () => {
    it('works', async () => {
      const senses = await entriesService.createSensesWithAssociationsOld(
        createEntrySearchRecord('bank'),
        true
      );
      expect(senses.length).toBeTruthy();
    });

    it('creates synonym entries if relatedEntriesAdded is true, but not if it is false', async () => {
      const originalThesaurusRecord = createThesaurusSearchRecord('bank', [
        'side'
      ]);
      const sideEntryRecord = createEntrySearchRecord('side');
      const sideThesaurusRecord = createThesaurusSearchRecord('side', [
        'border'
      ]);
      const borderEntryRecord = createEntrySearchRecord('border');
      const borderThesaurusRecord = createThesaurusSearchRecord('border', [
        'verge'
      ]);
      const vergeEntryRecord = createEntrySearchRecord('verge');
      const vergeThesaurusRecord = createThesaurusSearchRecord(
        'verge',
        [],
        false
      );

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(word => {
          switch (word) {
            case 'side':
              return Promise.resolve([sideEntryRecord]);
            case 'border':
              return Promise.resolve([borderEntryRecord]);
            case 'verge':
              return Promise.resolve([vergeEntryRecord]);
            default:
              throw new Error(`Unknown word: ${word}`);
          }
        });

      jest
        .spyOn(thesaurusSearchesService, 'findOrFetch')
        .mockImplementation(word => {
          switch (word) {
            case 'bank':
              return Promise.resolve([originalThesaurusRecord]);
            case 'side':
              return Promise.resolve([sideThesaurusRecord]);
            case 'border':
              return Promise.resolve([borderThesaurusRecord]);
            case 'verge':
              return Promise.resolve([vergeThesaurusRecord]);
            default:
              throw new Error(`Unknown word: ${word}`);
          }
        });

      await entriesService.createSensesWithAssociationsOld(
        originalThesaurusRecord,
        true
      );

      const entries_side = await entriesService.find('side');
      expect(entries_side.length).toEqual(1);
      expect(entries_side[0].relatedEntriesAdded).toBeFalsy();
      expect(entries_side[0].synonymSenseIds[0]).toBe(
        'bank-thesaurus-sense_1_id'
      );

      const entries_border = await entriesService.find('border');
      expect(entries_border.length).toEqual(0);
    });
  });

  describe('make topLevel', () => {
    it("does not make synonym 'quick' into an entry until orig entry is relatedEntriesAdded", async () => {
      const oxId = 'fast';
      const record = createEntrySearchRecord(oxId);

      const quickEntryRecord = createEntrySearchRecord('quick');
      const quickThesaurusRecord = createThesaurusSearchRecord(
        'quick',
        [],
        false
      );

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(word => {
          switch (word) {
            case 'quick':
              return Promise.resolve([quickEntryRecord]);
            default:
              throw new Error(`Unknown word: ${word}`);
          }
        });

      jest
        .spyOn(thesaurusSearchesService, 'findOrFetch')
        .mockImplementation(word => {
          switch (word) {
            case 'quick':
              return Promise.resolve([quickThesaurusRecord]);
            default:
              throw new Error(`Unknown word: ${word}`);
          }
        });

      const relatedEntriesAdded = false;
      const origWord = await entriesService.createEntryFromSearchRecord(record);

      await entriesService.createSensesWithAssociationsOld(
        createThesaurusSearchRecord(oxId, ['quick']),
        relatedEntriesAdded
      );

      const quick = await entriesService.find('quick');
      expect(quick.length).toBeFalsy();

      await entriesService.makeTopLevel(origWord.oxId, origWord.homographC);

      const quick2 = await entriesService.find('quick');
      expect(quick2.length).toBeTruthy();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await entriesService.createEntryFromSearchRecord(
        createEntrySearchRecord('river')
      );
    });
    it('matches if characters match', async () => {
      expect(await entriesService.search('ri')).toHaveLength(1);
    });
    it('does not match if characters do not match', async () => {
      expect(await entriesService.search('wrong_string')).toHaveLength(0);
    });
    it('is case insenstivie', async () => {
      expect(await entriesService.search('RI')).toHaveLength(1);
    });
    it('does not return match if not at start of word', async () => {
      expect(await entriesService.search('ver')).toHaveLength(0);
    });
    it('does not return results given empty search string', async () => {
      expect(await entriesService.search('')).toHaveLength(0);
    });
  });
});
