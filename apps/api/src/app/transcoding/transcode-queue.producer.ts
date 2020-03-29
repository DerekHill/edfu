import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME } from '../constants';

export interface TranscodeJobData {
  s3KeyOrig: string;
}

@Injectable()
export class TranscodeQueueProducer {
  constructor(
    @InjectQueue(TRANSCODE_QUEUE_NAME)
    private transcodeQueue: Queue<TranscodeJobData>
  ) {}

  async addTranscodeJob(s3KeyOrig: string) {
    const job = await this.transcodeQueue.add({
      s3KeyOrig: s3KeyOrig
    });
  }
}
