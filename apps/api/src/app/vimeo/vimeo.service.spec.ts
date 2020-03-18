import { promises as fs } from 'fs';
import * as path from 'path';
import { TestingModule, Test } from '@nestjs/testing';
import {
  VimeoService,
  VimeoUploadParams,
  VimeoBuffer,
  VimeoUploadDoneFn,
  VimeoProgressFn,
  VimeoErrorFn,
  VimeoGetParams,
  VimeoCallback
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
      it('uploads video', async done => {
        expect.assertions(1);

        const params: VimeoUploadParams = {
          name: 'Test video',
          description: 'Test description.'
        };

        const filePath = path.resolve(__dirname, './test/test_sign_fast.mp4');

        const data: VimeoBuffer = await fs.readFile(filePath);
        data.size = data.byteLength;

        const vimeoDoneFn: VimeoUploadDoneFn = (uri: string) => {
          console.log('Your video URI is: ' + uri);
          expect(uri).toBeTruthy();
          done();
        };

        const vimeoProgressFn: VimeoProgressFn = (
          bytes_uploaded: number,
          bytes_total: number
        ) => {
          const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
          console.log(bytes_uploaded, bytes_total, percentage + '%');
        };

        const vimeoErrorFn: VimeoErrorFn = (error: any) => {
          console.log('Failed because: ' + error);
          done(error);
        };

        return service.upload(
          data,
          params,
          vimeoDoneFn,
          vimeoProgressFn,
          vimeoErrorFn
        );
      }, 20000);
    });

    describe('getVideo', () => {
      it('gets video information', done => {
        const videoId = '398484228';
        const getParams: VimeoGetParams = {
          method: 'GET',
          path: `/videos/${videoId}`
        };

        const callback: VimeoCallback = (error, body, status_code, headers) => {
          if (error) {
            done(error);
          }

          expect(status_code).toBe(200);
          expect(body.type).toBe('video');
          done();
        };

        return service.getVideo(getParams, callback);
      });
    });

    describe('getVideoIdFromUri', () => {
      it('get id', () => {
        const videoId = '398464138';
        const uri = `/videos/${videoId}`;
        const res = service.getVideoIdFromUri(uri);
        expect(res).toBe(videoId);
      });
    });
  });
});
