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
import { SignRecord, SenseSignRecordWithoutId } from '@edfu/api-interfaces';
import { SignTestSetupService } from './sign-test-setup.service';
import { CreateSignInput } from './dto/create-sign.input';

describe('SignsService', () => {
  let service: SignsService;
  let setupService: SignTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema },
          { name: SIGN_COLLECTION_NAME, schema: SignSchema }
        ])
      ],
      providers: [SignsService, SignTestSetupService]
    }).compile();

    service = module.get<SignsService>(SignsService);
    setupService = module.get<SignTestSetupService>(SignTestSetupService);
  });

  it('SignsTestSetupService.create', async () => {
    const data: SignRecord = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'foo',
      mediaUrl: 'link',
      s3KeyOrig: '1234.mp4'
    };
    const record = await setupService.createSign(data);
    expect(record.mediaUrl).toEqual(data.mediaUrl);
  });

  it('getSenseSigns', async () => {
    const senseId = 'm_en_gbus0423120.004';
    const signId = new ObjectId();
    const senseSignData: SenseSignRecordWithoutId[] = [
      {
        userId: new ObjectId(),
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

  it('createSignWithAssociations', async () => {
    const mnemonic = 'remember!';
    const signData: CreateSignInput = {
      mediaUrl: 'www.goo.com',
      mnemonic: mnemonic,
      senseIds: ['id1', 'id2'],
      s3KeyOrig: '1234.mp4'
    };
    const sign = await service.createSignWithAssociations(
      new ObjectId(),
      signData
    );
    expect(sign.mnemonic).toBe(mnemonic);
  });

  it.skip('handles mediaUrl that already exists', () => {});
});
