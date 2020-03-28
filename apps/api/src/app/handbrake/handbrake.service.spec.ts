import { TestingModule, Test } from '@nestjs/testing';
import { HandbrakeService } from './handbrake.service';
import * as path from 'path';
import { promises as fs } from 'fs';

const TEST_VIDEO_PATH = path.resolve(
  __dirname,
  './test/short_sample_video.mp4'
);

const TEMP_DIR = './tmp';

describe('HandbrakeService', () => {
  let service: HandbrakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [HandbrakeService]
    }).compile();

    service = module.get<HandbrakeService>(HandbrakeService);
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
  });
});
