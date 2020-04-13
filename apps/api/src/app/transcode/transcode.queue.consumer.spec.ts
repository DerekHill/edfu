import { TestingModule, Test } from '@nestjs/testing';
import { TranscodeQueueConsumer } from './transcode-queue.consumer';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as Bull from 'bull';
import { TranscodeJobData } from './interfaces/transcode-job-data.interface';
import { ObjectId } from 'bson';
import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { SIGN_COLLECTION_NAME } from '../constants';
import { Model } from 'mongoose';
import { SignDocument } from '../reference/signs/interfaces/sign.interface';
import { SignRecord, Transcoding } from '@edfu/api-interfaces';
import { TestDatabaseModule } from '../config/test-database.module';
import { SignSchema } from '../reference/signs/schemas/sign.schema';
import { S3Service } from '../s3/s3.service';

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
    s3KeyOrig: s3KeyOrig,
    transcodings: transcodings
  };
};

const createTranscoding = (key: string): Transcoding => {
  return {
    height: 100,
    width: 200,
    duration: 5,
    size: 10,
    s3Key: key,
    bitrate: 100,
    rotation: 0
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

describe('TranscodeService', () => {
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

  describe('ffprobe()', () => {
    it('returns size of test video file', async () => {
      const res = await service.ffprobe(TEST_VIDEO_PATH);
      expect(res.format.size).toBe(149139);
    });
  });

  describe('runFfmpeg()', () => {
    it('transcodes video from one path to another', async () => {
      const outputPath = path.resolve(__dirname, './test/output.mp4');
      const presetConfig = {
        name: '360p',
        longEdgePixels: 640,
        bitrate: 750
      };
      return expect(
        service.runFfmpeg(TEST_VIDEO_PATH, outputPath, presetConfig)
      ).resolves.toBeUndefined();
    });
  });

  describe('transcode()', () => {
    it('returns transcodings', async () => {
      const s3KeyOrig = '1234.mp4';
      await setupService.createSign(createSignRecord(s3KeyOrig));

      const job = createBullJob(s3KeyOrig);
      const res = await service.transcode(job);
      expect(res.length).toBe(4);
    }, 30000);
  });

  describe('addTranscodingsToSet()', () => {
    it('adds transcodings', async () => {
      const s3KeyOrig = 'myVideo.mp4';
      const s3KeyNew = service._appendToName(s3KeyOrig, 1);
      const transcodings: Transcoding[] = [createTranscoding(s3KeyNew)];

      const signRecord = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        mnemonic: '',
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
      const transcodings: Transcoding[] = [createTranscoding(s3KeyNew)];

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
      const transcodings: Transcoding[] = [createTranscoding(s3KeyNew)];

      await setupService.createSign(createSignRecord(s3KeyOrig, transcodings));
      const res = await service._filterOutExistingTranscodings(
        s3KeyOrig,
        transcodings
      );
      expect(res.length).toBeFalsy();
    });
  });
});
