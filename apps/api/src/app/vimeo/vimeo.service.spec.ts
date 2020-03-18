import { promises as fs } from 'fs';
import * as path from 'path';
import { TestingModule, Test } from '@nestjs/testing';
import {
  VimeoService,
  VimeoUploadParams,
  VimeoBuffer,
  VimeoGetParams,
  SmooshedResponseBody
} from './vimeo.service';

describe('VimeoService', () => {
  let service: VimeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [VimeoService]
    }).compile();

    service = module.get<VimeoService>(VimeoService);
  });

  describe.skip('VimeoService (skipped because makes API calls)', () => {
    describe('upload', () => {
      it('returns videoId', async () => {
        const params: VimeoUploadParams = {
          name: 'Test video',
          description: 'Test description.'
        };

        const filePath = path.resolve(__dirname, './test/test_sign_fast.mp4');

        const data: VimeoBuffer = await fs.readFile(filePath);
        data.size = data.byteLength;

        const res: string = await service.upload(data, params);
        expect(res).toBeDefined();
      }, 20000);
    });

    describe('getVideo (videoId must exist for test to pass)', () => {
      it('gets video information', async () => {
        const videoId = '398484228';
        const getParams: VimeoGetParams = {
          method: 'GET',
          path: `/videos/${videoId}`
        };

        const res: SmooshedResponseBody = await service.getVideo(getParams);
        expect(res.status_code).toBe(200);
      });
    });

    describe('_extractVideoId', () => {
      it('get id', () => {
        const videoId = '398464138';
        const uri = `/videos/${videoId}`;
        const res = service._extractVideoId(uri);
        expect(res).toBe(videoId);
      });
    });
  });
});
