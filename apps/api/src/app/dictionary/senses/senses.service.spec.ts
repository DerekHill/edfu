import { ObjectId } from 'bson';
import { Test, TestingModule } from '@nestjs/testing';
import { SensesService } from './senses.service';
import { TestDatabaseModule } from '../../config/test-database.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { SenseSchema } from './schemas/sense.schema';
import { SENSE_COLLECTION_NAME, ENTRY_COLLECTION_NAME } from '../../constants';
import { LexicalCategory, DictionaryOrThesaurus } from '@edfu/enums';
import { OxSense } from '../../oxford-api/interfaces/oxford-api.interface';
import { EntrySchema } from '../entries/schemas/entry.schema';
import { EntrySenseRecord } from '../entry-senses/interfaces/entry-sense.interface';
import { EntrySensesService } from '../entry-senses/entry-senses.service';
import {
  ThesaurusSenseRecord,
  SenseDocument,
  SharedSenseRecordWithoutId,
  DictionarySenseRecordWithoutId,
  LinkedSensePairing
} from './interfaces/sense.interface';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
class SensesTestSetupService {
  constructor(
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>
  ) {}

  create(
    sense: SharedSenseRecordWithoutId
  ): Promise<SharedSenseRecordWithoutId> {
    return this.senseModel.create(sense);
  }
}

class EntrySensesServiceMock {
  findOrCreate(): Promise<EntrySenseRecord> {
    return Promise.resolve(null);
  }
}

describe('SensesService', () => {
  let service: SensesService;
  let setupService: SensesTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
          { name: ENTRY_COLLECTION_NAME, schema: EntrySchema }
        ])
      ],
      providers: [
        SensesService,
        {
          provide: EntrySensesService,
          useClass: EntrySensesServiceMock
        },
        SensesTestSetupService
      ]
    }).compile();

    service = module.get<SensesService>(SensesService);
    setupService = module.get<SensesTestSetupService>(SensesTestSetupService);
  });

  describe('findOrCreateDictionarySenseWithAssociation', () => {
    it('returns created sense', async () => {
      const SENSE_ID = 'm_en_gbus0378040.005';
      const oxSense: OxSense = {
        id: SENSE_ID
      };
      const res = await service.findOrCreateDictionarySenseWithAssociation(
        'oxId',
        null,
        LexicalCategory.noun,
        0,
        oxSense
      );
      expect(res.senseId).toEqual(SENSE_ID);
    });

    it.skip('creates association', () => {});
  });

  describe('extractThesaurusLinks', () => {
    it('works when thesaurusLinks are provided', () => {
      const SENSE_ID = 'sense_id';
      const sense: OxSense = {
        id: 'm_en_gbus0378040.005',
        thesaurusLinks: [
          {
            entry_id: 'entry_id',
            sense_id: SENSE_ID
          }
        ]
      };
      const res = service.extractThesaurusLinks(sense);
      expect(res).toEqual([SENSE_ID]);
    });

    it('does not raise exception when thesaurusLinks are not provided', () => {
      const sense: OxSense = {
        id: 'm_en_gbus0378040.005'
      };
      expect(service.extractThesaurusLinks(sense)).toBeDefined();
    });
  });

  describe('populateThesaurusLinkedSenses', () => {
    it('finds linked dictionary sense by thesaurusSenseIds', async () => {
      const DICTIONARY_SENSE_ID = 'dictionarySenseId';
      const THESAURUS_SENSE_ID = 'thesaurusSenseId';
      const dictionarySense: DictionarySenseRecordWithoutId = {
        senseId: DICTIONARY_SENSE_ID,
        entryOxId: 'jump',
        entryHomographC: 0,
        lexicalCategory: LexicalCategory.noun,
        apiSenseIndex: 0,
        dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
        thesaurusSenseIds: [THESAURUS_SENSE_ID],
        definition: 'jump in the air',
        example: 'look how high it jumped!'
      };
      const thesaurusSense: ThesaurusSenseRecord = {
        _id: new ObjectId(),
        entryOxId: 'entryOxId',
        entryHomographC: 1,
        dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
        lexicalCategory: LexicalCategory.noun,
        apiSenseIndex: 0,
        senseId: THESAURUS_SENSE_ID,
        example: 'example of sense',
        synonyms: ['jump', 'leap']
      };

      await setupService.create(dictionarySense);
      const res: LinkedSensePairing = await service.populateThesaurusLinkedSenses(
        thesaurusSense
      );
      expect(res.dictionarySenses.length).toEqual(1);
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
      const res = service._extractSynonyms(thesaurusSense);
      expect(res.sort()).toEqual(['marge', 'edge'].sort());
    });

    it('does not go wrong if there are no subsenses or synonyms', () => {
      const dictionarySense = {
        definitions: ['any nutritious substance'],
        examples: [{ text: 'we need food and water' }],
        id: 'm_en_gbus0378040.005'
      };
      const res = service._extractSynonyms(dictionarySense);
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
      const res = service._extractSynonyms(sense);
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
      const res = service._extractSynonyms(sense);
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
      const res = service._extractSynonyms(sense);
      expect(res).toEqual([]);
    });
  });
});
