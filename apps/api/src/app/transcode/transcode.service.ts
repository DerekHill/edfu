import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

@Injectable()
export class TranscodeService {
  ffprobe: (path: string) => Promise<ffmpeg.FfprobeData> = promisify(
    ffmpeg.ffprobe
  );

  async ffprobeBlank() {
    try {
      const res = await this.ffprobe('');
      return res.format.size;
    } catch (error) {
      if (error.message.match(/No input specified/)) {
        return 'expected result';
      } else {
        throw error;
      }
    }
  }
}
