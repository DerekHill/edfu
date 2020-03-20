import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { registerUser, login, TEST_USER } from './test.helper';
import { TestDatabaseModule } from '../src/app/config/test-database.module';
import { S3Service } from '../src/app/s3/s3.service';
import { VimeoService } from '../src/app/vimeo/vimeo.service';
import { VimeoVideoStatus } from '@edfu/api-interfaces';

const VIDEO_ID = '12345678';
const STATUS = VimeoVideoStatus.available;

class S3ServiceMock {
  upload = (file: Buffer | any, key: string) => {
    return Promise.resolve({ Key: VIDEO_ID });
  };

  public async getObject(key: string): Promise<any> {
    return null;
  }
}

class VimeoServiceMock {
  uploadBuffer(oxId, buffer) {
    return VIDEO_ID;
  }

  getVideoStatus(videoId) {
    return STATUS;
  }
}

describe('SignsController (e2e)', () => {
  let app: any;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule, // before AppModule,
        AppModule
      ]
    })
      .overrideProvider(S3Service)
      .useValue(new S3ServiceMock())
      .overrideProvider(VimeoService)
      .useValue(new VimeoServiceMock())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = await app.getHttpServer();
  });

  describe('Post', () => {
    it('returns mediaUrl', async () => {
      await registerUser(server, TEST_USER);
      const token = await login(TEST_USER.email, TEST_USER.password, server);
      const bufferFile = Buffer.from('dummy data');

      return request(server)
        .post('/signs')
        .set('Authorization', 'bearer ' + token)
        .field({ oxId: 'food' })
        .attach('file', bufferFile, 'myfilename.mp4')
        .then(({ body }) => {
          expect(body.success).toBeTruthy();
          expect(body.data.mediaUrl).toMatch(new RegExp(VIDEO_ID, 'i'));
        });
    });

    it('is not successful if file is not supplied', async () => {
      await registerUser(server, TEST_USER);
      const token = await login(TEST_USER.email, TEST_USER.password, server);

      return request(server)
        .post('/signs')
        .set('Authorization', 'bearer ' + token)
        .field({ oxId: 'food' })
        .then(({ body }) => expect(body.success).toBeFalsy());
    });
  });
});
