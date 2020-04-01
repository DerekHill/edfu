import { S3Service } from './s3.service';
import { TestingModule, Test } from '@nestjs/testing';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [S3Service]
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  describe.skip('S3Service (skipped because makes S3 calls)', () => {
    describe('with buffer', () => {
      const bufferKey = 'upload1';
      const bufferContents = 'dummy data1';

      it('uploads', async () => {
        const bufferFile = Buffer.from(bufferContents);
        const res = await service.upload(bufferFile, bufferKey);
        expect(res.Key).toBe(bufferKey);
      });

      it('downloads', async () => {
        const res = await service.getObject(bufferKey);
        expect(res.toString()).toBe(bufferContents);
      });
    });
  });
});
