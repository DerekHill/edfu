import { TestingModule, Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesService } from './likes.service';
import { TestDatabaseModule } from '../../config/test-database.module';
import {
  LIKE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../../constants';
import { LikeSchema } from './schemas/like.schema';
import { ManageLikeParams } from '@edfu/api-interfaces';
import { ObjectId } from 'bson';
import { SignTestSetupService } from '../../reference/signs/sign-test-setup.service';
import { SenseSignSchema } from '../../reference/signs/schemas/sense-sign.schema';
import { SignSchema } from '../../reference/signs/schemas/sign.schema';

describe('LikesService', () => {
  let service: LikesService;
  let setupService: SignTestSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: LIKE_COLLECTION_NAME, schema: LikeSchema },
          { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema },
          { name: SIGN_COLLECTION_NAME, schema: SignSchema }
        ])
      ],
      providers: [LikesService, SignTestSetupService]
    }).compile();

    service = module.get<LikesService>(LikesService);
    setupService = module.get<SignTestSetupService>(SignTestSetupService);
  });

  describe('create like (by specified user)', () => {
    describe('senseId is specified', () => {
      it('upserts like for specified sign & sense', async () => {
        const params: ManageLikeParams = {
          userId: new ObjectId(),
          signId: new ObjectId(),
          senseId: 'senseId'
        };
        const res = await service.create(params);
        expect(res.length).toBe(1);
      });

      it('removes likes for any other signs for specified sense', async () => {
        const senseId = 'senseId';
        const userId = new ObjectId();
        const previouslyLikedSignId = new ObjectId();
        const previouslyLikedSignParams: ManageLikeParams = {
          userId: userId,
          signId: previouslyLikedSignId,
          senseId: senseId
        };
        await service.create(previouslyLikedSignParams);

        const newlyLikedSignParams: ManageLikeParams = {
          userId: userId,
          signId: new ObjectId(),
          senseId: senseId
        };
        await service.create(newlyLikedSignParams);

        const res = await service.find({ senseId: senseId, userId: userId });
        expect(res.length).toBe(1);
      });
    });

    describe('senseId is not specified', () => {
      it('upserts like for sign for all of its senses', async () => {
        const signId = new ObjectId();
        const userId = new ObjectId();
        await setupService.createSenseSign({ signId: signId });
        await setupService.createSenseSign({ signId: signId });
        const params: ManageLikeParams = {
          userId: userId,
          signId: signId
        };
        await service.create(params);
        const res = await service.find({ signId: signId, userId: userId });
        expect(res.length).toBe(2);
        expect(res[0].userId).toEqual(userId);
        expect(res[0].signId).toEqual(signId);
      });

      it('removes likes for other signs that share any senses with specified sign', async () => {
        const userId = new ObjectId();
        const senseId_1 = 'senseId_1';
        const signId = new ObjectId();
        const senseId_2 = 'senseId_2';
        const otherSignId = new ObjectId();
        await setupService.createSenseSign({
          senseId: senseId_1,
          signId: signId
        });
        await setupService.createSenseSign({
          senseId: senseId_2,
          signId: signId
        });
        await service.create({
          userId: userId,
          signId: otherSignId,
          senseId: senseId_2
        });
        await service.create({
          userId: userId,
          signId: signId
        });
        const res = await service.find({ userId: userId });
        expect(res.length).toBe(2);
        expect(res[0].signId).toEqual(signId);
        expect(res[1].signId).toEqual(signId);
      });
    });
  });

  describe('delete like (by specified user)', () => {
    it('when senseId is specified it deletes that like', async () => {
      const userId = new ObjectId();
      const senseId = 'senseId';
      const signId = new ObjectId();
      const params: ManageLikeParams = {
        userId: userId,
        signId: signId,
        senseId: senseId
      };
      await service.create(params);
      await service.remove(params);
      const res = await service.find({ userId: userId });
      expect(res.length).toBe(0);
    });

    it('when senseId is not specified it removes likes for other signs that share any senses with specified sign', async () => {
      const userId = new ObjectId();
      const senseId_1 = 'senseId_1';
      const signId = new ObjectId();
      const senseId_2 = 'senseId_2';
      const otherSignId = new ObjectId();
      await setupService.createSenseSign({
        senseId: senseId_1,
        signId: signId
      });
      await setupService.createSenseSign({
        senseId: senseId_2,
        signId: signId
      });
      await service.create({
        userId: userId,
        signId: otherSignId,
        senseId: senseId_2
      });
      await service.remove({
        userId: userId,
        signId: signId
      });
      const res = await service.find({ userId: userId });
      expect(res.length).toBe(0);
    });
  });
});
