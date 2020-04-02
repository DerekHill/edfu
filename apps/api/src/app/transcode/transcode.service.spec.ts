import { TranscodeService } from './transcode.service';
import { TestingModule, Test } from '@nestjs/testing';
import * as path from 'path';

const TEST_VIDEO_PATH = path.resolve(
  __dirname,
  './test/short_sample_video.mp4'
);

describe('TranscodeService', () => {
  let service: TranscodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [TranscodeService]
    }).compile();

    service = module.get<TranscodeService>(TranscodeService);
  });

  describe('ffprobe', () => {
    it('return size of test video file', async () => {
      const res = await service.ffprobe(TEST_VIDEO_PATH);
      expect(res.format.size).toBe(149139);
    });
  });
});
