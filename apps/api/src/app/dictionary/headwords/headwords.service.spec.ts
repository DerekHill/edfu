import { Test, TestingModule } from '@nestjs/testing';
import { HeadwordsService } from './headwords.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HeadwordSchema } from './schemas/headword.schema';
import {
  HEADWORD_COLLECTION_NAME,
  SENSE_COLLECTION_NAME
} from '../../constants';
import { TestDatabaseModule } from '../../config/test-database.module';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import { ObjectId } from 'bson';
import { SensesService } from '../senses/senses.service';
import { SenseSchema } from '../senses/schemas/sense.schema';
import { OxfordSearchesServiceMock } from '../../oxford-searches/test/oxford-searches.service.mock';

const entryRecord = (
  word: string,
  found = true,
  homographC = 1
): OxfordSearchRecord => {
  return {
    _id: new ObjectId(),
    normalizedSearchTerm: 'bank',
    result: {
      id: word,
      language: 'en-gb',
      lexicalEntries: [
        {
          entries: [
            {
              senses: [
                {
                  definitions: [
                    'any nutritious substance that people or animals eat or drink'
                  ],
                  examples: [{ text: 'we need food and water' }],
                  id: `${word}-entry-sense_1_id`
                }
              ]
            }
          ],
          language: 'en-gb',
          lexicalCategory: { id: 'noun', text: 'Noun' },
          text: word
        }
      ],
      type: 'headword',
      word: word
    },
    homographC: homographC,
    found: found
  };
};

const thesaurusRecord = (
  word: string,
  synonyms: string[],
  found = true
): OxfordSearchRecord => {
  return {
    _id: new ObjectId(),
    normalizedSearchTerm: word,
    result: {
      id: word,
      language: 'en-gb',
      lexicalEntries: [
        {
          entries: [
            {
              homographNumber: '100',
              senses: [
                {
                  examples: [
                    {
                      text: 'the banks of Lake Michigan'
                    }
                  ],
                  id: `${word}-thesaurus-sense_1_id`,
                  synonyms: synonyms.map(synonym => {
                    return {
                      id: synonym,
                      language: 'en',
                      text: synonym
                    };
                  })
                }
              ]
            }
          ],
          language: 'en-gb',
          lexicalCategory: {
            id: 'noun',
            text: 'Noun'
          },
          text: word
        }
      ],
      type: 'headword',
      word: word
    },
    homographC: 1,
    found: found
  };
};

describe('HeadwordsService', () => {
  let headwordsService: HeadwordsService;
  let entrySearchesService: EntrySearchesService;
  let thesaurusSearchesService: ThesaurusSearchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: HEADWORD_COLLECTION_NAME, schema: HeadwordSchema }
        ]),
        MongooseModule.forFeature([
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
        ])
      ],
      providers: [
        HeadwordsService,
        SensesService,
        {
          provide: EntrySearchesService,
          useClass: OxfordSearchesServiceMock
        },
        {
          provide: ThesaurusSearchesService,
          useClass: OxfordSearchesServiceMock
        }
      ]
    }).compile();

    headwordsService = module.get<HeadwordsService>(HeadwordsService);
    entrySearchesService = module.get<EntrySearchesService>(
      EntrySearchesService
    );
    thesaurusSearchesService = module.get<ThesaurusSearchesService>(
      ThesaurusSearchesService
    );
  });

  describe('createHeadword', () => {
    it('creates basic headword', async () => {
      const record: OxfordSearchRecord = entryRecord('river');
      const topLevel = true;
      const origWord = await headwordsService.createHeadword(record, topLevel);
      expect(origWord.topLevel).toBeTruthy();
    });
  });

  describe('findOrCreate', () => {
    it('creates headword if found and adds ownSenseID', async () => {
      const word = 'food';
      const record = entryRecord(word);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      const senseId = record.result.lexicalEntries[0].entries[0].senses[0].id;

      const words = await headwordsService.findOrCreateAndUpdateSenses(word);
      expect(words[0].word).toEqual(word);
      expect(words[0].ownSenseIds).toEqual(expect.arrayContaining([senseId]));
    });

    it('does not create headword if not found in dictionary', async () => {
      const word = 'xyzxzy';
      const record = entryRecord(word, false);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      return expect(
        headwordsService.findOrCreateAndUpdateSenses(word)
      ).rejects.toMatchObject({
        message: expect.stringMatching(/not found/)
      });
    });

    it('adds synonymSenseId if headwords already existed without it', async () => {
      const word = 'sheep';
      const record = entryRecord(word);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([record]));

      await headwordsService.findOrCreateAndUpdateSenses(word);

      const synonymSenseId = 'my_id';

      const words = await headwordsService.findOrCreateAndUpdateSenses(
        word,
        false,
        synonymSenseId
      );

      expect(words[0].synonymSenseIds[0]).toEqual(synonymSenseId);
    });

    it('does not update the synonym sense ids if the headword has multiple homonyms', async () => {
      const word = 'jaguar';
      const jaguarCar = entryRecord(word, true, 1);
      const jaguarCat = entryRecord(word, true, 2);

      jest
        .spyOn(entrySearchesService, 'findOrFetch')
        .mockImplementation(() => Promise.resolve([jaguarCar, jaguarCat]));

      await headwordsService.findOrCreateAndUpdateSenses(word);

      const synonymSenseId = 'my_id';

      const words = await headwordsService.findOrCreateAndUpdateSenses(
        word,
        false,
        synonymSenseId
      );

      expect(words[0].synonymSenseIds).toEqual([]);
    });
  });

  describe('createSenses', () => {
    it('works', async () => {
      const senses = await headwordsService.createSenses(
        entryRecord('bank'),
        true
      );
      expect(senses.length).toBeTruthy();
    });

    it('creates synonym headwords if topLevel is true, but not if it is false', async () => {
      const originalThesaurusRecord = thesaurusRecord('bank', ['side']);
      const sideEntryRecord = entryRecord('side');
      const sideThesaurusRecord = thesaurusRecord('side', ['border']);
      const borderEntryRecord = entryRecord('border');
      const borderThesaurusRecord = thesaurusRecord('border', ['verge']);
      const vergeEntryRecord = entryRecord('verge');
      const vergeThesaurusRecord = thesaurusRecord('verge', [], false);

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

      await headwordsService.createSenses(originalThesaurusRecord, true);

      const headwords_side = await headwordsService.find('side');
      expect(headwords_side.length).toEqual(1);
      expect(headwords_side[0].topLevel).toBeFalsy();
      expect(headwords_side[0].synonymSenseIds[0]).toBe(
        'bank-thesaurus-sense_1_id'
      );

      const headwords_border = await headwordsService.find('border');
      expect(headwords_border.length).toEqual(0);
    });
  });

  describe('make topLevel', () => {
    it("does not make synonym 'quick' into a headword until orig headword is topLevel", async () => {
      const oxId = 'fast';
      const record = entryRecord(oxId);

      const quickEntryRecord = entryRecord('quick');
      const quickThesaurusRecord = thesaurusRecord('quick', [], false);

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

      const topLevel = false;
      const origWord = await headwordsService.createHeadword(record, topLevel);

      await headwordsService.createSenses(
        thesaurusRecord(oxId, ['quick']),
        topLevel
      );

      const quick = await headwordsService.find('quick');
      expect(quick.length).toBeFalsy();

      await headwordsService.makeTopLevel(origWord.oxId, origWord.homographC);

      const quick2 = await headwordsService.find('quick');
      expect(quick2.length).toBeTruthy();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await headwordsService.createHeadword(entryRecord('river'), true);
    });
    it('matches if characters match', async () => {
      expect(await headwordsService.search('ri')).toHaveLength(1);
    });
    it('does not match if characters do not match', async () => {
      expect(await headwordsService.search('wrong_string')).toHaveLength(0);
    });
    it('is case insenstivie', async () => {
      expect(await headwordsService.search('RI')).toHaveLength(1);
    });
    it('does not return match if not at start of word', async () => {
      expect(await headwordsService.search('ver')).toHaveLength(0);
    });
  });
});
