import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

@Injectable()
export class TranscodeService {
  ffprobe: (path: string) => Promise<ffmpeg.FfprobeData> = promisify(
    ffmpeg.ffprobe
  );
}
