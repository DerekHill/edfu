import { Test, TestingModule } from '@nestjs/testing';
import { SignsService } from './signs.service';
import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SIGN_COLLECTION_NAME } from '../../constants';
import {
  SignDocument,
  SignRecord,
  SignRecordWithoutId
} from './interfaces/sign.interface';
import { TestDatabaseModule } from '../../config/test-database.module';
import { SignSchema } from './schemas/sign.schema';

@Injectable()
class SignsTestSetupService {
  constructor(
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  create(sign: SignRecordWithoutId): Promise<SignRecord> {
    return this.signModel.create(sign);
  }
}

describe('SignsService', () => {
  let service: SignsService;
  let setupService: SignsTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SIGN_COLLECTION_NAME, schema: SignSchema }
        ])
      ],
      providers: [SignsService, SignsTestSetupService]
    }).compile();

    service = module.get<SignsService>(SignsService);
    setupService = module.get<SignsTestSetupService>(SignsTestSetupService);
  });

  it('SignsTestSetupService.create', async () => {
    const data: SignRecordWithoutId = {
      senseId: 'id',
      mnemonic: 'foo',
      media_url: 'link'
    };
    const record = await setupService.create(data);
    expect(record.senseId).toEqual(data.senseId);
  });

  it('findBySenseId', async () => {
    const MATCHING_ID = 'matching_id';
    const data: SignRecordWithoutId[] = [
      {
        senseId: MATCHING_ID,
        mnemonic: 'foo',
        media_url: 'link'
      },
      {
        senseId: 'other_sense',
        mnemonic: 'foo',
        media_url: 'link'
      }
    ];
    await Promise.all(
      data.map((obj: SignRecordWithoutId) => {
        return setupService.create(obj);
      })
    );

    const res = await service.findBySenseId(MATCHING_ID);
    expect(res.length).toBe(1);
  });
});
