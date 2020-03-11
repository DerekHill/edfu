// https://github.com/marcomelilli/nestjs-email-authentication

import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { login } from './test.helper';
import { CreateUserDto } from '../src/app/users/dto/create-user.dto';
import { TestDatabaseModule } from '../src/app/config/test-database.module';

const registerUser = (server: any, user: CreateUserDto) => {
  return request(server)
    .post('/auth/register')
    .send(user);
};

describe('AuthController (e2e)', () => {
  let app: any;
  let server: any;

  const USER: CreateUserDto = {
    username: 'fred',
    email: 'fred@gmail.com',
    password: '12345'
  };

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
      await registerUser(server, USER);
      return request(server)
        .post('/auth/login')
        .send({ email: USER.email, password: USER.password })
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
      await registerUser(server, USER);
      const token = await login(USER.email, USER.password, server);

      return request(server)
        .get('/auth/profile')
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .then((res: any) => expect(res.body.email).toBe(USER.email));
    });
  });

  describe('/register', () => {
    it('registers new user successfully', async () => {
      const res = await registerUser(server, USER);
      expect(res.body.success).toBeTruthy();
    });
  });

  //   https://gabrieltanner.org/blog/nestjs-graphqlserver
  describe('graphql authentication', () => {
    it('unauthenticated query', () => {
      const basicTestQuery = `
        query {
          getTestSign{mnemonic}
        }`;

      return request(server)
        .post('/graphql')
        .send({
          operationName: null,
          query: basicTestQuery
        })
        .expect(({ body }) => {
          const data = body.data.getTestSign;
          expect(data.mnemonic).toBe('remember me');
        });
    });

    describe('authenticated query and user decorator', () => {
      it('returns 401 if no token is supplied', () => {
        const authenticatedTestQuery = `
              query {
                  getAuthenticatedTestSign{mnemonic}
              }`;

        return request(server)
          .post('/graphql')
          .send({
            operationName: null,
            query: authenticatedTestQuery
          })
          .expect(({ body }) => {
            expect(body.errors[0].message.statusCode).toBe(401);
          });
      });

      it('works if token is supplied', async () => {
        await registerUser(server, USER);
        const token = await login(USER.email, USER.password, server);

        const authenticatedTestQuery = `
              query {
                  getAuthenticatedTestSign{mnemonic}
              }`;

        return request(server)
          .post('/graphql')
          .set('Authorization', 'bearer ' + token)
          .send({
            operationName: null,
            query: authenticatedTestQuery
          })
          .expect(({ body }) => {
            const data = body.data.getAuthenticatedTestSign;
            expect(data.mnemonic).toBe(USER.email);
          });
      });
    });
  });
});
