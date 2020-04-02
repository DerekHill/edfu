import {
  Processor,
  Process,
  OnQueueError,
  OnQueueCompleted,
  OnQueueFailed
} from '@nestjs/bull';
import { Job } from 'bull';
import { TRANSCODE_QUEUE_NAME, SIGN_COLLECTION_NAME } from '../constants';
import * as hbjs from 'handbrake-js';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from '../s3/s3.service';
import {
  HandbrakePreset,
  Transcoding,
  HandbrakeVideoProperties
} from '@edfu/api-interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignDocument } from '../reference/signs/interfaces/sign.interface';
import { TranscodeJobData } from './interfaces/transcode-job-data.interface';
import { HandbrakeOutput } from './interfaces/handbrake-output.interface';

const TEMP_DIR = './tmp';

export const DEFAULT_HANDBRAKE_PRESET = HandbrakePreset.Very_Fast_480p30;

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
  @Process()
  async transcode(job: Job<TranscodeJobData>): Promise<Transcoding[]> {
    const s3KeyOrig = job.data.s3KeyOrig;

    console.log(`Transcoding job ${job.id} for key ${s3KeyOrig}`);

    const origFile = await this.s3Service.getObject(s3KeyOrig);

    const origVideoPath = path.join(TEMP_DIR, s3KeyOrig);

    await fs.promises.writeFile(origVideoPath, origFile);

    const newKey = this._appendToName(s3KeyOrig, 1);

    const newVideoPath = path.join(TEMP_DIR, newKey);

    const output = await this.runHandbrake(
      origVideoPath,
      newVideoPath,
      DEFAULT_HANDBRAKE_PRESET
    );

    const inputVideoProps = this._parseFullHandbrakeOutput(output);
    const ouputVideoProps = this._parseJsonJobHandbrakeOutput(output);

    const newVideoFile = await fs.promises.readFile(newVideoPath);

    await this.s3Service.upload(newVideoFile, newKey);

    const origStats = fs.statSync(origVideoPath);
    const newStats = fs.statSync(newVideoPath);

    await fs.promises.unlink(origVideoPath);
    await fs.promises.unlink(newVideoPath);

    const transcodings = [
      {
        ...inputVideoProps,
        ...{
          size: origStats.size,
          s3Key: s3KeyOrig,
          preset: HandbrakePreset.noop
        }
      },
      {
        ...ouputVideoProps,
        ...{
          size: newStats.size,
          s3Key: newKey,
          preset: DEFAULT_HANDBRAKE_PRESET
        }
      }
    ];

    await this._addTranscodingsToSet(s3KeyOrig, transcodings);

    return transcodings;
  }

  _appendToName(filename: string, toAppend: string | number): string {
    const ext = path.parse(filename).ext;
    const bareName = path.parse(filename).name;
    return `${bareName}_${toAppend}${ext}`;
  }

  _parseJsonJobHandbrakeOutput(
    output: HandbrakeOutput
  ): HandbrakeVideoProperties {
    const handbrakeJsonJobRegex = new RegExp(
      /(?<=]\sjson\sjob:)([\s\S]*)(?=\[\d\d:\d\d:\d\d]\sStarting\sTask:)/,
      'g'
    );

    try {
      const jsonJob = JSON.parse(output.stderr.match(handbrakeJsonJobRegex)[0]);

      const duration = jsonJob.Destination.ChapterList[0].Duration;
      const filterList = jsonJob.Filters.FilterList;
      const sizeFilter = filterList.filter(i => i.Settings.height)[0];

      return {
        height: sizeFilter.Settings.height,
        width: sizeFilter.Settings.width,
        durationSeconds:
          duration.Seconds + duration.Minutes * 60 + duration.Hours * 60 * 60
      };
    } catch (error) {
      console.error('parseJsonJobHandbrakeOutput Error', error);
      return {
        height: null,
        width: null,
        durationSeconds: null
      };
    }
  }

  _parseFullHandbrakeOutput(output: HandbrakeOutput): HandbrakeVideoProperties {
    const sterr = output.stderr;
    const originalSizeRegex = new RegExp(
      /(\+\ssize\:\s)(\d*)(x)(\d*)(,\spixel\saspect)/,
      'g'
    );

    const durationRegex = new RegExp(
      /(\+\sduration\:\s)(\d\d)(\:)(\d\d)(\:)(\d\d)/,
      'g'
    );

    const sizeMatch = originalSizeRegex.exec(sterr);
    const durationMatch = durationRegex.exec(sterr);
    try {
      return {
        height: Number(sizeMatch[4]),
        width: Number(sizeMatch[2]),
        durationSeconds:
          Number(durationMatch[6]) +
          Number(durationMatch[4]) * 60 +
          Number(durationMatch[2]) * 60 * 60
      };
    } catch (error) {
      console.error('parseFullHandbrakeOutput Error', error);
      return {
        height: null,
        width: null,
        durationSeconds: null
      };
    }
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

  private runHandbrake(
    input: string,
    output: string,
    preset: HandbrakePreset
  ): Promise<HandbrakeOutput> {
    const options = {
      input: input,
      output: output,
      preset: preset,
      optimize: true,
      'loose-anamorphic': true
    };

    return hbjs.run(options);
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
      `Failed job ${job.id} for key ${job.data.s3KeyOrig}: ${error.message}`
    );
  }
}
