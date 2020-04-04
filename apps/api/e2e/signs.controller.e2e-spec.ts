import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { registerUser, login, TEST_USER } from './test.helper';
import { TestDatabaseModule } from '../src/app/config/test-database.module';
import { S3Service } from '../src/app/s3/s3.service';
import { TranscodeQueueConsumer } from '../src/app/transcode/transcode-queue.consumer';

class S3ServiceMock {
  upload = (file: Buffer, key: string) => {
    return Promise.resolve({ Key: 'mock_s3_key' });
  };

  public async getObject(key: string): Promise<any> {
    return null;
  }
}

class TranscodeQueueConsumerMock {}

describe('SignsController (e2e)', () => {
  let app: any;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, AppModule]
    })
      .overrideProvider(S3Service)
      .useValue(new S3ServiceMock())
      .overrideProvider(TranscodeQueueConsumer)
      .useValue(new TranscodeQueueConsumerMock())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = await app.getHttpServer();
  });

  describe('Post', () => {
    it('return sign', async () => {
      await registerUser(server, TEST_USER);
      const token = await login(TEST_USER.email, TEST_USER.password, server);
      const bufferFile = Buffer.from('dummy data');
      const mnemonic = 'help me remember';

      return request(server)
        .post('/signs')
        .set('Authorization', 'bearer ' + token)
        .field({ mnemonic: mnemonic })
        .field({ senseIds: ['sense1', 'sense2', 'sense3'] })
        .attach('file', bufferFile, 'myfilename.mp4')
        .then(({ body }) => {
          expect(body.mnemonic).toBe(mnemonic);
        });
    });

    it('is not successful if file is not supplied', async () => {
      await registerUser(server, TEST_USER);
      const token = await login(TEST_USER.email, TEST_USER.password, server);

      return request(server)
        .post('/signs')
        .set('Authorization', 'bearer ' + token)
        .field({ mnemonic: 'help me remember' })
        .field({ senseIds: ['a', 'b', 'c'] })
        .then(({ body }) => expect(body.success).toBeFalsy());
    });
  });
});
