import { Test, TestingModule } from '@nestjs/testing';
import { SignsService } from './signs.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SIGN_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME
} from '../../constants';
import { TestDatabaseModule } from '../../config/test-database.module';
import { SignSchema } from './schemas/sign.schema';
import { ObjectId } from 'bson';
import { SenseSignSchema } from './schemas/sense-sign.schema';
import { SignsTestSetupService } from './signs-test-setup.service';
import { SignRecord, SenseSignRecordWithoutId } from '@edfu/api-interfaces';

describe('SignsService', () => {
  let service: SignsService;
  let setupService: SignsTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema }
        ]),
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
    const data: SignRecord = {
      _id: new ObjectId(),
      mnemonic: 'foo',
      mediaUrl: 'link'
    };
    const record = await setupService.createSign(data);
    expect(record.mediaUrl).toEqual(data.mediaUrl);
  });

  it('getSenseSigns', async () => {
    const senseId = 'm_en_gbus0423120.004';
    const signId = new ObjectId();
    const senseSignData: SenseSignRecordWithoutId[] = [
      {
        senseId: senseId,
        signId: signId
      }
    ];
    await Promise.all(
      senseSignData.map((obj: SenseSignRecordWithoutId) => {
        return setupService.createSenseSign(obj);
      })
    );

    const res = await service.getSenseSigns(senseId);
    expect(res[0].signId).toEqual(signId);
  });
});
