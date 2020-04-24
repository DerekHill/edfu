import { TestingModule, Test } from '@nestjs/testing';
import { TestDatabaseModule } from '../config/test-database.module';
import { MongooseModule } from '@nestjs/mongoose';
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
import { DictionaryOrThesaurus } from '@edfu/api-interfaces';

describe('ReferenceService', () => {
  let service: ReferenceService;
  let setupService: ReferenceTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
          { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema },
          { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
          { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema },
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
    it('returns oxId if it has signs', async () => {
      const OXID = 'food';

      await setupService.createEntry({
        oxId: OXID,
        word: OXID
      });
      await setupService.createEntrySense({
        oxId: OXID
      });
      await setupService.createSenseSign({});
      const res = await service.searchOxIds('foo', true);
      expect(res.includes(OXID)).toBeTruthy();
    });

    it('does not return oxId if it does not have signs', async () => {
      const OXID = 'food';
      await setupService.createEntry({
        oxId: OXID
      });
      const FILTER = true;
      const res = await service.searchOxIds(OXID, FILTER);
      expect(res.includes(OXID)).toBeFalsy();
    });
  });

  describe('getSignsByAssociation', () => {
    it('gets signs for senseId', async () => {
      const SENSE_ID = 'sense_id';
      const SIGN_ID = new ObjectId();

      await setupService.createSenseSign({
        senseId: SENSE_ID,
        signId: SIGN_ID
      });
      await setupService.createSign({
        _id: SIGN_ID
      });
      const res = await service.getSignsByAssociation(SENSE_ID);
      expect(res[0]._id).toEqual(SIGN_ID);
    });
  });

  describe('sensesForOxIdCaseInsensitive', () => {
    it('returns correct sense', async () => {
      const OXID = 'food';
      const SENSE_ID = 'sense_id';

      await setupService.createEntrySense({
        oxId: OXID,
        senseId: SENSE_ID
      });
      await setupService.createSense({
        senseId: SENSE_ID
      });
      await setupService.createSenseSign({
        senseId: `${SENSE_ID}`
      });

      const res = await service.sensesForOxIdCaseInsensitive({ oxId: OXID });
      expect(res[0].senseId).toBe(SENSE_ID);
    });

    it('filters for hasSign', async () => {
      const OXID = 'food';
      const SENSE_ID = 'sense_id';

      await setupService.createEntrySense({
        oxId: OXID,
        senseId: SENSE_ID
      });
      await setupService.createSense({
        senseId: SENSE_ID
      });

      const res = await service.sensesForOxIdCaseInsensitive({
        oxId: OXID,
        filterForHasSign: true
      });
      expect(res.length).toBeFalsy();
    });

    it('filters for dictionary senses only', async () => {
      const OXID = 'food';

      await setupService.createEntrySense({
        oxId: OXID,
        associationType: DictionaryOrThesaurus.thesaurus
      });

      await setupService.createSense({});

      const res = await service.sensesForOxIdCaseInsensitive({
        oxId: OXID,
        filterForHasSign: false,
        filterForDictionarySenses: true
      });
      expect(res.length).toBeFalsy();
    });
  });

  describe('_removeInvalidRegexChars', () => {
    it('removes backslashes', () => {
      expect(service._removeInvalidRegexChars('f\\')).toEqual('f');
    });
  });
});
