import { Test, TestingModule } from '@nestjs/testing';
import { SensesService } from './senses.service';
import { TestDatabaseModule } from '../../config/test-database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SenseSchema } from './schemas/sense.schema';
import {
  SENSE_COLLECTION_NAME,
  HEADWORD_COLLECTION_NAME
} from '../../constants';
import { LexicalCategory } from '../../enums';
import { DICTIONARY_SENSE_BANK } from './test/sample-results';
import { OxSense } from '../../oxford-api/interfaces/oxford-api.interface';
import { HeadwordsService } from '../headwords/headwords.service';
import { HeadwordSchema } from '../headwords/schemas/headword.schema';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchesServiceMock } from '../../oxford-searches/test/oxford-searches.service.mock';

describe('SensesService', () => {
  let service: SensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
          { name: HEADWORD_COLLECTION_NAME, schema: HeadwordSchema }
        ])
      ],
      providers: [
        SensesService,
        HeadwordsService,
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

    service = module.get<SensesService>(SensesService);
  });

  describe('findOrCreate', () => {
    it('works', async () => {
      const headwordOxId = 'bank';
      const headwordHomographC = 0;
      const lexicalCategory = LexicalCategory.adjective;
      const oxSense: OxSense = DICTIONARY_SENSE_BANK;
      expect(
        service.findOrCreate(
          headwordOxId,
          headwordHomographC,
          lexicalCategory,
          oxSense
        )
      ).resolves.toBeTruthy();
    });
  });

  describe('create', () => {
    it('works with dictionary sense', async () => {
      const example = 'we need food and water';
      const headwordOxId = 'bank';
      const headwordHomographC = 0;
      const lexicalCategory = LexicalCategory.adjective;
      const dictionarySense = {
        definitions: ['any nutritious substance'],
        examples: [{ text: example }],
        id: 'm_en_gbus0378040.005'
      };

      const res = await service.findOrCreate(
        headwordOxId,
        headwordHomographC,
        lexicalCategory,
        dictionarySense
      );

      expect(res.example).toBe(example);
    });
  });

  describe('extractSynonyms', () => {
    it('extracts synonyms from the top level, and from subsenses', () => {
      const thesaurusSense = {
        id: 't_en_gb0001138.001',
        subsenses: [
          {
            id: 'ide0de6afd-76df-4ed0-a6f0-a27b353306fc',
            synonyms: [
              {
                language: 'en',
                text: 'marge'
              }
            ]
          }
        ],
        synonyms: [
          {
            id: 'edge',
            language: 'en',
            text: 'edge'
          }
        ]
      };
      const res = service.extractSynonyms(thesaurusSense);
      expect(res.sort()).toEqual(['marge', 'edge'].sort());
    });

    it('does not go wrong if there are no subsenses or synonyms', () => {
      const dictionarySense = {
        definitions: ['any nutritious substance'],
        examples: [{ text: 'we need food and water' }],
        id: 'm_en_gbus0378040.005'
      };
      const res = service.extractSynonyms(dictionarySense);
      expect(res).toEqual([]);
    });

    it('does not include senses in proscribed registers', () => {
      const sense = {
        id: 'id',
        registers: [
          {
            id: 'literary',
            text: 'Literary'
          }
        ],
        synonyms: [
          {
            id: 'edge',
            language: 'en',
            text: 'edge'
          }
        ],
        subsenses: [
          {
            id: 'id',
            synonyms: [
              {
                language: 'en',
                text: 'marge'
              }
            ]
          }
        ]
      };
      const res = service.extractSynonyms(sense);
      expect(res).toEqual([]);
    });

    it('skips subsenses in proscribed registers', () => {
      const sense = {
        id: 'id',
        synonyms: [
          {
            id: 'edge',
            language: 'en',
            text: 'edge'
          }
        ],
        subsenses: [
          {
            id: 'id',
            synonyms: [
              {
                language: 'en',
                text: 'marge'
              }
            ],
            registers: [
              {
                id: 'rare',
                text: 'Rare'
              }
            ]
          }
        ]
      };
      const res = service.extractSynonyms(sense);
      expect(res).toEqual(['edge']);
    });

    it('skips synonyms with spaces', () => {
      const sense = {
        id: 'id',
        synonyms: [
          {
            id: 'wind_up',
            language: 'en',
            text: 'wind up'
          }
        ]
      };
      const res = service.extractSynonyms(sense);
      expect(res).toEqual([]);
    });
  });
});
