import { Controller, Get } from '@nestjs/common';
import { TranscodeService } from './transcode.service';

@Controller('ffmpeg')
export class FfmpegTestController {
  constructor(private transcodeService: TranscodeService) {}

  @Get()
  async test() {
    const res = await this.transcodeService.ffprobeBlank();
    return res;
  }
}
