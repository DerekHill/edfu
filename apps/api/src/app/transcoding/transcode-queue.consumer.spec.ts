import { TestingModule, Test } from '@nestjs/testing';
import { TranscodeQueueConsumer, TEMP_DIR } from './transcode-queue.consumer';
import * as path from 'path';
import { promises as fs } from 'fs';

const TEST_VIDEO_PATH = path.resolve(
  __dirname,
  './test/short_sample_video.mp4'
);

describe('TranscodeQueueConsumer', () => {
  let service: TranscodeQueueConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [TranscodeQueueConsumer]
    }).compile();

    service = module.get<TranscodeQueueConsumer>(TranscodeQueueConsumer);
  });

  it('writes, transcodes and deletes file', async () => {
    const rawVideoBuffer = await fs.readFile(TEST_VIDEO_PATH);
    const rawVideoPath = path.join(TEMP_DIR, 'raw_video.mp4');
    await service.writeToFs(rawVideoPath, rawVideoBuffer);

    const transcodedVideoPath = path.join(TEMP_DIR, 'output.mp4');

    await expect(
      service.run(TEST_VIDEO_PATH, transcodedVideoPath)
    ).resolves.toBeTruthy();

    expect(fs.access(rawVideoPath)).resolves.toBeUndefined();
    expect(fs.access(transcodedVideoPath)).resolves.toBeUndefined();

    await service.deleteFile(rawVideoPath);
    await service.deleteFile(transcodedVideoPath);

    expect(fs.access(rawVideoPath)).rejects.toThrowError();
  }, 20000);
});
