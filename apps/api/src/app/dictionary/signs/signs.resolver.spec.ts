import { SignsService } from './signs.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SignsResolver } from './signs.resolver';
import { ObjectId } from 'bson';
import { SignsTestSetupService } from './signs-test-setup.service';
import { TestDatabaseModule } from '../../config/test-database.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../../constants';
import { SenseSignSchema } from './schemas/sense-sign.schema';
import { SignSchema } from './schemas/sign.schema';
import { SenseSignRecordWithoutId, SignRecord } from '@edfu/api-interfaces';

describe('SignsResolver integration test', () => {
  let resolver: SignsResolver;
  let signsService: SignsService;
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
      providers: [SignsResolver, SignsService, SignsTestSetupService]
    }).compile();

    resolver = module.get<SignsResolver>(SignsResolver);
    signsService = module.get<SignsService>(SignsService);
    setupService = module.get<SignsTestSetupService>(SignsTestSetupService);
  });

  it('return signs and sense separately', async () => {
    const senseId = 'm_en_gbus0423120.004';
    const signId = new ObjectId();
    const mnemonic = 'Adding more to a pile';
    const signData: SignRecord[] = [
      {
        _id: signId,
        mediaUrl:
          'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/More.gif',
        mnemonic: mnemonic
      }
    ];

    const senseSignData: SenseSignRecordWithoutId[] = [
      {
        senseId: senseId,
        signId: signId
      }
    ];
    await Promise.all(
      signData.map((obj: SignRecord) => {
        return setupService.createSign(obj);
      })
    );

    await Promise.all(
      senseSignData.map((obj: SenseSignRecordWithoutId) => {
        return setupService.createSenseSign(obj);
      })
    );

    const senseSignWithoutProperty = await resolver.signs(senseId);
    expect(senseSignWithoutProperty[0].signId).toEqual(signId);

    const propertyOnly = await resolver.sign(senseSignWithoutProperty[0]);
    expect(propertyOnly.mnemonic).toBe(mnemonic);
  });
});
