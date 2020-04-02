import { Module } from '@nestjs/common';
import { TranscodeService } from './transcode.service';

@Module({
  imports: [],
  providers: [TranscodeService],
  exports: [TranscodeService]
})
export class TranscodeModule {}
