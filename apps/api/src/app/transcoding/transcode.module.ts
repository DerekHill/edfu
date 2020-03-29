import { Module } from '@nestjs/common';
import { TranscodeQueueProducer } from './transcode-queue.producer';
import { TranscodeTestController } from './transcode.test.controller';
import { BullModule } from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME } from '../constants';
import { TranscodeQueueConsumer } from './transcode-queue.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCODE_QUEUE_NAME,
      redis: process.env.REDIS_URL
    })
  ],
  controllers: [TranscodeTestController],
  providers: [TranscodeQueueProducer, TranscodeQueueConsumer],
  exports: []
})
export class TranscodeModule {}
