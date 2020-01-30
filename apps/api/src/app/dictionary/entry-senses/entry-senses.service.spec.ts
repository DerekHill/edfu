import { Test, TestingModule } from '@nestjs/testing';
import { EntrySensesService } from './entry-senses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestDatabaseModule } from '../../config/test-database.module';
import { ENTRY_SENSE_COLLECTION_NAME } from '../../constants';
import { EntrySenseSchema } from './schemas/entry-sense.schema';

describe('EntrySensesService', () => {
  let service: EntrySensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema }
        ])
      ],
      providers: [EntrySensesService]
    }).compile();

    service = module.get<EntrySensesService>(EntrySensesService);
  });

  it('findOrCreate', async () => {
    const res = await service.findOrCreate('oxID', 1, 'senseId', 0.5);
    expect(res).toBeDefined();
  });
});
