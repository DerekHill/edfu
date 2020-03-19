import { promises as fs } from 'fs';
import * as path from 'path';
import { TestingModule, Test } from '@nestjs/testing';
import {
  VimeoService,
  VimeoUploadParams,
  VimeoBuffer,
  VimeoCommonGetParams,
  SmooshedResponseBody
} from './vimeo.service';
import { makeBody } from './test/response.mock';
import { VimeoVideoStatus } from '@edfu/api-interfaces';

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

    describe('getVideoStatus', () => {
      it('gets correct status if video is not found', async () => {
        const invalidVideoId = '000000000';
        const res = await service.getVideoStatus(invalidVideoId);
        expect(res).toBe(VimeoVideoStatus.not_found);
      });
    });

    describe('getVideo (videoId must exist for test to pass)', () => {
      it('gets video information', async () => {
        const videoId = '398789046';
        const getParams: VimeoCommonGetParams = {
          method: 'GET',
          path: `/videos/${videoId}`
        };

        const res: SmooshedResponseBody = await service.commonGet(getParams);
        expect(res.status_code).toBe(200);
      });
    });

    describe('_extractStatusFromApiResponse', () => {
      it('does something', () => {
        const status = VimeoVideoStatus.transcoding;
        const body = makeBody(VimeoVideoStatus.transcoding);
        const res = service._extractStatusFromApiResponse(body);
        expect(res).toBe(status);
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
