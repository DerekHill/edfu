import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import {
  Processor,
  Process,
  OnQueueError,
  OnQueueCompleted,
  OnQueueFailed
} from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME, SIGN_COLLECTION_NAME } from '../constants';
import { S3Service } from '../s3/s3.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignDocument } from '../reference/signs/interfaces/sign.interface';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from 'bull';
import { TranscodeJobData } from './interfaces/transcode-job-data.interface';
import { Transcoding, VideoProperties } from '@edfu/api-interfaces';

const TEMP_DIR = './tmp';

const FORMAT_EXTENSION = 'mp4';

// https://www.dacast.com/blog/video-transcoding-service-mobile-bitrate/
function mediumPreset(command: ffmpeg.FfmpegCommand) {
  command
    .format(FORMAT_EXTENSION)
    .videoCodec('libx264')
    .videoBitrate(900)
    .size('480x?')
    .outputOptions(['-movflags faststart', '-strict -2']); // `-strict -2` for ffmpeg version 2.8.15 on Travis where aac audio is experimental
}

@Processor(TRANSCODE_QUEUE_NAME)
export class TranscodeQueueConsumer {
  constructor(
    private s3Service: S3Service,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }
  }

  ffprobe: (path: string) => Promise<ffmpeg.FfprobeData> = promisify(
    ffmpeg.ffprobe
  );

  getAvailableCodecs = promisify(ffmpeg.getAvailableCodecs);

  getAvailableFormats = promisify(ffmpeg.getAvailableFormats);

  @Process()
  async transcode(job: Job<TranscodeJobData>): Promise<Transcoding[]> {
    const s3KeyOrig = job.data.s3KeyOrig;

    console.log(`Transcoding job ${job.id} for key ${s3KeyOrig}`);

    const origFile = await this.s3Service.getObject(s3KeyOrig);

    const origVideoPath = path.join(TEMP_DIR, s3KeyOrig);

    await fs.promises.writeFile(origVideoPath, origFile);

    const newKey = this._appendToName(s3KeyOrig, 1);

    const newVideoPath = path.join(TEMP_DIR, newKey);

    await this.runFfmpeg(origVideoPath, newVideoPath);

    const inputVideoProps = await this._getSummaryStatsAndLog(
      origVideoPath,
      `${s3KeyOrig} input:`
    );
    const ouputVideoProps = await this._getSummaryStatsAndLog(
      newVideoPath,
      `${newKey} output:`
    );

    const newVideoFile = await fs.promises.readFile(newVideoPath);

    await this.s3Service.upload(newVideoFile, newKey);

    await fs.promises.unlink(origVideoPath);
    await fs.promises.unlink(newVideoPath);

    const transcodings = [
      {
        ...inputVideoProps,
        ...{
          s3Key: s3KeyOrig
        }
      },
      {
        ...ouputVideoProps,
        ...{
          s3Key: newKey
        }
      }
    ];

    await this._addTranscodingsToSet(s3KeyOrig, transcodings);

    return transcodings;
  }

  @OnQueueError()
  private onError(error: Error) {
    console.error(`Job got error: ${error.message}`);
  }

  @OnQueueCompleted()
  private onCompleted(job: Job<TranscodeJobData>, result: any) {
    console.log(`Completed job ${job.id} for key ${job.data.s3KeyOrig}`);
  }

  @OnQueueFailed()
  private onFailed(job: Job<TranscodeJobData>, error: Error) {
    console.error(
      `Error: Failed job ${job.id} for key ${job.data.s3KeyOrig}: ${error.message}`
    );
  }

  async runFfmpeg(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .preset(mediumPreset)
        .on('start', commandLine => {
          console.log('start ffmpeg with command: ' + commandLine);
        })
        .on('codecData', data => {
          console.log(`Input is ${data.audio} audio with ${data.video} video`);
        })
        .on('error', (err, stdout, stderr) => {
          console.error('Cannot process video:');
          console.error(err);
          console.error(stderr);
          reject(err);
        })
        .save(outputPath)
        .on('end', (stdout, stderr) => {
          console.log('Transcoding succeeded !');
          resolve();
        });
    });
  }

  async _getSummaryStatsAndLog(
    filePath: string,
    descriptor = ''
  ): Promise<VideoProperties> {
    const probeData = await this.ffprobe(filePath);
    const stats = this.summarizeFfprobe(probeData);
    console.log(descriptor);
    console.log(this.humanReadableSummaryStats(stats));
    return stats;
  }

  summarizeFfprobe(input: ffmpeg.FfprobeData): VideoProperties {
    const videoStream = input.streams.find(s => s.height);
    return {
      height: videoStream.height,
      width: videoStream.width,
      duration: input.format.duration,
      size: input.format.size,
      bitrate: input.format.bit_rate,
      rotation: videoStream.rotation || 0
    };
  }

  humanReadableSummaryStats(summaryStats: VideoProperties) {
    return {
      height: summaryStats.height,
      width: summaryStats.width,
      duration: summaryStats.duration,
      size: this.humanFileSize(summaryStats.size),
      bitrate: this.humanFileSize(summaryStats.bitrate),
      rotation: summaryStats.rotation
    };
  }

  async _filterOutExistingTranscodings(
    s3KeyOrig: string,
    transcodings: Transcoding[]
  ): Promise<Transcoding[]> {
    const sign = await this.signModel.findOne({
      s3KeyOrig: s3KeyOrig
    });
    const existingKeys = sign.transcodings.map(t => t.s3Key);
    return transcodings.filter(t => !existingKeys.includes(t.s3Key));
  }

  async _addTranscodingsToSet(
    s3KeyOrig: string,
    transcodings: Transcoding[]
  ): Promise<any> {
    const newTranscodings = await this._filterOutExistingTranscodings(
      s3KeyOrig,
      transcodings
    );

    return this.signModel.updateOne(
      { s3KeyOrig: s3KeyOrig },
      { $push: { transcodings: { $each: newTranscodings } } }
    );
  }

  _appendToName(filename: string, toAppend: string | number): string {
    const bareName = path.parse(filename).name;
    return `${bareName}_${toAppend}.${FORMAT_EXTENSION}`;
  }

  private humanFileSize(bytes: number) {
    const thresh = 1000;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }
}
