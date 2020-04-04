import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { login, registerUser, TEST_USER } from './test.helper';
import { TestDatabaseModule } from '../src/app/config/test-database.module';

describe('AuthController (e2e)', () => {
  let app: any;
  let server: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule, // before AppModule
        AppModule
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    server = await app.getHttpServer();
  });

  describe('LocalAuthGuard /auth/login (POST)', () => {
    it('returns JWT token with valid credentials', async () => {
      await registerUser(server, TEST_USER);
      return request(server)
        .post('/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(/access_token/);
    });

    it('returns 404 to user with invalid credentials', () => {
      return request(server)
        .post('/auth/login')
        .send({ email: 'invalid', password: 'invalid' })
        .expect(404);
    });
  });

  describe('JwtAuthGuard', () => {
    it('/auth/profile (GET) returns 200', async () => {
      await registerUser(server, TEST_USER);
      const token = await login(TEST_USER.email, TEST_USER.password, server);

      return request(server)
        .get('/auth/profile')
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .then((res: any) => expect(res.body.email).toBe(TEST_USER.email));
    });
  });

  describe('/register', () => {
    it('registers new user successfully', async () => {
      const res = await registerUser(server, TEST_USER);
      expect(res.body.success).toBeTruthy();
    });
  });
});
