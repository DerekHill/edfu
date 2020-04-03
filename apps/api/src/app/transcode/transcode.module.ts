import { Module, Injectable } from '@nestjs/common';
import { TranscodeQueueConsumer } from './transcode-queue.consumer';
import { BullModule } from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME, SIGN_COLLECTION_NAME } from '../constants';
import { S3Module } from '../s3/s3.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SignSchema } from '../reference/signs/schemas/sign.schema';

@Injectable()
class EmpyTranscodeQueueConsumer {}

const transcodeQueueConsumerProvider = {
  provide: TranscodeQueueConsumer,
  useClass:
    process.env.PROVIDE_CONSUMER === 'yes'
      ? TranscodeQueueConsumer
      : EmpyTranscodeQueueConsumer
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCODE_QUEUE_NAME,
      redis: process.env.REDIS_URL
    }),
    S3Module,
    MongooseModule.forFeature([
      { name: SIGN_COLLECTION_NAME, schema: SignSchema }
    ])
  ],
  providers: [transcodeQueueConsumerProvider],
  exports: []
})
export class TranscodeModule {}
