import { TestingModule, Test } from '@nestjs/testing';
import { TestDatabaseModule } from '../config/test-database.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { ReferenceService } from './reference.service';
import {
  ENTRY_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../constants';
import { EntrySchema } from './entries/schemas/entry.schema';
import { EntrySenseSchema } from './entry-senses/schemas/entry-sense.schema';
import { SenseSchema } from './senses/schemas/sense.schema';
import { SenseSignSchema } from './signs/schemas/sense-sign.schema';
import { SignSchema } from './signs/schemas/sign.schema';
import { ReferenceTestSetupService } from './reference-test-setup.service';
import { ObjectId } from 'bson';
import { HeadwordOrPhrase } from '../enums';
import { DictionaryOrThesaurus } from '../../../../../libs/enums/src';

describe('ReferenceService', () => {
  let service: ReferenceService;
  let setupService: ReferenceTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_COLLECTION_NAME, schema: EntrySchema }
        ]),
        MongooseModule.forFeature([
          { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema }
        ]),
        MongooseModule.forFeature([
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
        ]),
        MongooseModule.forFeature([
          { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema }
        ]),
        MongooseModule.forFeature([
          { name: SIGN_COLLECTION_NAME, schema: SignSchema }
        ])
      ],
      providers: [ReferenceService, ReferenceTestSetupService]
    }).compile();

    service = module.get<ReferenceService>(ReferenceService);
    setupService = module.get<ReferenceTestSetupService>(
      ReferenceTestSetupService
    );
  });

  describe('searchOxIds with filter for signs', () => {
    it.only('returns oxId if it has signs', async () => {
      const OXID = 'food';
      const HOMOGRAPH_C = 0;
      const SENSE_ID = 'sense_id';
      const entryData = {
        _id: new ObjectId(),
        oxId: OXID,
        homographC: HOMOGRAPH_C,
        word: OXID,
        relatedEntriesAdded: false,
        headwordOrPhrase: HeadwordOrPhrase.headword
      };

      const entrySenseData = {
        _id: new ObjectId(),
        oxId: OXID,
        homographC: HOMOGRAPH_C,
        senseId: SENSE_ID,
        associationType: DictionaryOrThesaurus.dictionary,
        similarity: 0.7
      };

      const senseSignData = {
        senseId: `${SENSE_ID}`,
        signId: new ObjectId()
      };
      await setupService.createEntry(entryData);
      await setupService.createEntrySense(entrySenseData);
      await setupService.createSenseSign(senseSignData);
      const FILTER = true;
      const res = await service.searchOxIds('foo', FILTER);
      expect(res.includes(OXID)).toBeTruthy();
    });
  });

  describe('_removeInvalidRegexChars', () => {
    it('removes backslashes', () => {
      expect(service._removeInvalidRegexChars('f\\')).toEqual('f');
    });
  });
});
