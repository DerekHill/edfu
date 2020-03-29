import {
  Processor,
  Process,
  OnQueueError,
  OnQueueCompleted,
  OnQueueFailed
} from '@nestjs/bull';
import { Job } from 'bull';
import { TRANSCODE_QUEUE_NAME } from '../constants';
import { TranscodeJobData } from './transcode-queue.producer';
import * as hbjs from 'handbrake-js';
import * as fs from 'fs';

export const TEMP_DIR = './tmp';

// https://handbrake.fr/docs/en/latest/technical/official-presets.html
enum HandbrakePreset {
  Very_Fast_480p30 = 'Very Fast 480p30'
}

interface HandbrakeResult {
  stdout: string;
  stderr: string;
}

@Processor(TRANSCODE_QUEUE_NAME)
export class TranscodeQueueConsumer {
  constructor() {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }
  }
  @Process()
  async transcode(job: Job<TranscodeJobData>) {
    console.log('transcoding...');
    return {};
  }

  run(input: string, output: string): Promise<HandbrakeResult> {
    const options = {
      input: input,
      output: output,
      preset: HandbrakePreset.Very_Fast_480p30,
      optimize: true
    };

    return hbjs.run(options);
  }

  writeToFs(path: string, data: any): Promise<void> {
    return fs.promises.writeFile(path, data);
  }

  deleteFile(path: string): Promise<void> {
    return fs.promises.unlink(path);
  }

  @OnQueueError()
  onError(error: Error) {
    throw error;
  }

  @OnQueueCompleted()
  onCompleted(job: Job<TranscodeJobData>, result: any) {
    console.log(`Completed job ${job.id} for key ${job.data.s3KeyOrig}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<TranscodeJobData>, error: Error) {
    console.error(`Failed job ${job.id} for key ${job.data.s3KeyOrig}`);
    throw error;
  }
}
