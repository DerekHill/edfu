import { UploadService } from './upload.service';
import { TestingModule, Test } from '@nestjs/testing';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [UploadService]
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe.skip('UploadService (skipped because makes S3 calls)', () => {
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

    describe('with blob', () => {
      const blobKey = 'upload2';
      const blobContents = 'dummy data2';

      it('uploads', async () => {
        const res = await service.upload(blobContents, blobKey);
        expect(res.Key).toBe(blobKey);
      });

      it('downloads', async () => {
        const res = await service.getObject(blobKey);
        expect(res.toString()).toBe(blobContents);
      });
    });
  });
});
