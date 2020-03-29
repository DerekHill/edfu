import { Controller, Get } from '@nestjs/common';
import { TranscodeQueueProducer } from './transcode-queue.producer';

@Controller('transcode')
export class TranscodeTestController {
  constructor(private producer: TranscodeQueueProducer) {}

  @Get('test')
  test() {
    this.producer.addTranscodeJob('1234');
    console.log('hit');
    return 'hit route';
  }
}
