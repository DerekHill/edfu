import { TestingModule, Test } from '@nestjs/testing';
import {
  TranscodeQueueConsumer,
  DEFAULT_HANDBRAKE_PRESET
} from './transcode-queue.consumer';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as Bull from 'bull';
import { S3Service } from '../s3/s3.service';
import {
  createHandbrakeOutputExampleIPhone,
  CreateHandbrakeOutputExampleIPhoneParams
} from './test/handbrake-output-example';
import { TestDatabaseModule } from '../config/test-database.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { SIGN_COLLECTION_NAME } from '../constants';
import { SignSchema } from '../reference/signs/schemas/sign.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SignDocument } from '../reference/signs/interfaces/sign.interface';
import { SignRecord, Transcoding } from '@edfu/api-interfaces';
import { ObjectId } from 'bson';
import { TranscodeJobData } from './interfaces/transcode-job-data.interface';

const TEST_VIDEO_PATH = path.resolve(
  __dirname,
  './test/short_sample_video.mp4'
);

class S3ServiceMock {
  getObject(key: string): Promise<any> {
    return fs.readFile(TEST_VIDEO_PATH);
  }

  upload = (file: Buffer, key: string) => {
    return Promise.resolve({});
  };
}

const createBullJob = (s3Key: string): Bull.Job<TranscodeJobData> => {
  return {
    id: 1,
    data: { s3KeyOrig: s3Key },
    opts: {},
    attemptsMade: 0,
    queue: null,
    timestamp: null,
    name: 'job',
    stacktrace: null,
    returnvalue: {},
    progress: null,
    log: null,
    isCompleted: null,
    isFailed: null,
    isActive: null,
    isDelayed: null,
    isPaused: null,
    isWaiting: null,
    isStuck: null,
    getState: null,
    remove: null,
    update: null,
    retry: null,
    discard: null,
    finished: null,
    moveToCompleted: null,
    moveToFailed: null,
    promote: null,
    lockKey: null,
    releaseLock: null,
    takeLock: null,
    toJSON: null
  };
};

const createSignRecord = (s3KeyOrig: string, transcodings = []) => {
  return {
    _id: new ObjectId(),
    userId: new ObjectId(),
    mnemonic: '',
    mediaUrl: 'www.foo.com',
    s3KeyOrig: s3KeyOrig,
    transcodings: transcodings
  };
};

@Injectable()
class SetupService {
  constructor(
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  createSign(sign: SignRecord): Promise<SignRecord> {
    return this.signModel.create(sign);
  }
}

describe.skip('TranscodeQueueConsumer, skip because deprecated', () => {
  let service: TranscodeQueueConsumer;
  let setupService: SetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: SIGN_COLLECTION_NAME, schema: SignSchema }
        ])
      ],
      providers: [
        TranscodeQueueConsumer,
        {
          provide: S3Service,
          useClass: S3ServiceMock
        },
        SetupService
      ]
    }).compile();

    service = module.get<TranscodeQueueConsumer>(TranscodeQueueConsumer);
    setupService = module.get<SetupService>(SetupService);
  });

  describe('transcode()', () => {
    it('returns transcodings', async () => {
      const s3KeyOrig = '1234.mp4';
      await setupService.createSign(createSignRecord(s3KeyOrig));

      const job = createBullJob(s3KeyOrig);
      const res = await service.transcode(job);
      expect(res.length).toBe(2);
    });
  });

  describe('parseJsonJobHandbrakeOutput()', () => {
    it('parses json job', () => {
      const height = 480;
      const width = 270;
      const params: CreateHandbrakeOutputExampleIPhoneParams = {
        outputHeight: height,
        outputWidth: width,
        durationSecondsMod: 3,
        durationMinutesMod: 2,
        durationHoursMod: 1
      };
      const handbrakeOutput = createHandbrakeOutputExampleIPhone(params);
      const res = service._parseJsonJobHandbrakeOutput(handbrakeOutput);
      expect(res.height).toBe(height);
      expect(res.width).toBe(width);
      expect(res.durationSeconds).toBe(3 + 2 * 60 + 1 * 60 * 60);
    });
  });

  describe('parseFullHandbrakeOutput', () => {
    it('parses full output', () => {
      const height = 1280;
      const width = 720;
      const handbrakeOutput = createHandbrakeOutputExampleIPhone({
        inputHeight: height,
        inputWidth: width,
        inputDurationString: '01:02:03'
      });
      const res = service._parseFullHandbrakeOutput(handbrakeOutput);
      expect(res.height).toBe(height);
      expect(res.width).toBe(width);
      expect(res.durationSeconds).toBe(3 + 2 * 60 + 1 * 60 * 60);
    });
  });

  describe('addTranscodingsToSet()', () => {
    it('adds transcodings', async () => {
      const s3KeyOrig = 'myVideo.mp4';
      const s3KeyNew = service._appendToName(s3KeyOrig, 1);
      const transcodings: Transcoding[] = [
        {
          height: 100,
          width: 200,
          durationSeconds: 5,
          size: 10,
          s3Key: s3KeyNew,
          preset: DEFAULT_HANDBRAKE_PRESET
        }
      ];

      const signRecord = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        mnemonic: '',
        mediaUrl: 'www.foo.com',
        s3KeyOrig: s3KeyOrig
      };

      await setupService.createSign(signRecord);

      const res = await service._addTranscodingsToSet(s3KeyOrig, transcodings);
      expect(res.nModified).toBe(1);
      expect(res.ok).toBe(1);
    });
  });

  describe('filterOutExistingTranscodings()', () => {
    it('returns transcoding if none exist', async () => {
      const s3KeyOrig = 'myVideo.mp4';
      const s3KeyNew = service._appendToName(s3KeyOrig, 1);
      const transcodings: Transcoding[] = [
        {
          height: 100,
          width: 200,
          durationSeconds: 5,
          size: 10,
          s3Key: s3KeyNew,
          preset: DEFAULT_HANDBRAKE_PRESET
        }
      ];

      await setupService.createSign(createSignRecord(s3KeyOrig));
      const res = await service._filterOutExistingTranscodings(
        s3KeyOrig,
        transcodings
      );
      expect(res.length).toBe(1);
    });

    it('does not return transcoding if it does exist', async () => {
      const s3KeyOrig = 'myVideo.mp4';
      const s3KeyNew = service._appendToName(s3KeyOrig, 1);
      const transcodings: Transcoding[] = [
        {
          height: 100,
          width: 200,
          durationSeconds: 5,
          size: 10,
          s3Key: s3KeyNew,
          preset: DEFAULT_HANDBRAKE_PRESET
        }
      ];

      await setupService.createSign(createSignRecord(s3KeyOrig, transcodings));
      const res = await service._filterOutExistingTranscodings(
        s3KeyOrig,
        transcodings
      );
      expect(res.length).toBeFalsy();
    });
  });
});
