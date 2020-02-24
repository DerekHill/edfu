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

describe('ReferenceService', () => {
  let service: ReferenceService;

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
      providers: [ReferenceService]
    }).compile();

    service = module.get<ReferenceService>(ReferenceService);
  });

  describe('_removeInvalidRegexChars', () => {
    it('removes backslashes', () => {
      expect(service._removeInvalidRegexChars('f\\')).toEqual('f');
    });
  });
});
