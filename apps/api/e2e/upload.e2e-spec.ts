import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { registerUser, login, TEST_USER } from './test.helper';
import { TestDatabaseModule } from '../src/app/config/test-database.module';
import { readFileSync } from 'fs';

describe('UploadController (e2e)', () => {
  let app: any;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule, // before AppModule,
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = await app.getHttpServer();
  });

  it('is successful if file is supplied', async () => {
    await registerUser(server, TEST_USER);
    const token = await login(TEST_USER.email, TEST_USER.password, server);
    const bufferFile = Buffer.from('dummy data');

    return request(server)
      .post('/upload/upload')
      .set('Authorization', 'bearer ' + token)
      .attach('file', bufferFile, 'myfilename')
      .then(({ body }) => expect(body.success).toBeTruthy());
  });

  it('is not successful if file is not supplied', async () => {
    await registerUser(server, TEST_USER);
    const token = await login(TEST_USER.email, TEST_USER.password, server);

    return request(server)
      .post('/upload/upload')
      .set('Authorization', 'bearer ' + token)
      .then(({ body }) => expect(body.success).toBeFalsy());
  });
});
