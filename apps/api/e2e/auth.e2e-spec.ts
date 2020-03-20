// https://github.com/marcomelilli/nestjs-email-authentication

import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { login, registerUser, TEST_USER } from './test.helper';
import { TestDatabaseModule } from '../src/app/config/test-database.module';
import { CreateSignInput } from '../src/app/reference/signs/dto/create-sign.input';

const jsonGqlString = (str: any): string => {
  return JSON.stringify(str).replace(/\"([^(\")"]+)\":/g, '$1:');
};

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
        await registerUser(server, TEST_USER);
        const token = await login(TEST_USER.email, TEST_USER.password, server);

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
            expect(data.mnemonic).toBe(TEST_USER.email);
          });
      });
    });

    describe('LexicographerResolver', () => {
      it('works if token is supplied', async () => {
        await registerUser(server, TEST_USER);
        const token = await login(TEST_USER.email, TEST_USER.password, server);
        const mediaUrl = 'my-url.com';

        const sign: CreateSignInput = {
          mediaUrl: mediaUrl,
          mnemonic: '',
          senseIds: ['1', '2'],
          s3Key: '1234.mp4'
        };

        const query = `
          mutation {
            createSignWithAssociations(
              createSignData: ${jsonGqlString(sign)}
            ) {
              mnemonic
              mediaUrl
            }
          }
        `;

        return request(server)
          .post('/graphql')
          .set('Authorization', 'bearer ' + token)
          .send({
            operationName: null,
            query: query
          })
          .expect(({ body }) => {
            const data = body.data.createSignWithAssociations;
            expect(data.mediaUrl).toBe(mediaUrl);
          });
      });

      it('returns 401 if token is not supplied', () => {
        const query = `
          mutation {
            createSignWithAssociations(
              createSignData: {mediaUrl: "mediaUrl", s3Key: "123" ,mnemonic: "", senseIds: [] }
            ) {
              mnemonic
              mediaUrl
            }
          }
        `;

        return request(server)
          .post('/graphql')
          .send({
            operationName: null,
            query: query
          })
          .expect(({ body }) => {
            expect(body.errors[0].message.statusCode).toBe(401);
          });
      });

      it('returns error if senseIds length is zero', async () => {
        await registerUser(server, TEST_USER);
        const token = await login(TEST_USER.email, TEST_USER.password, server);
        const mediaUrl = 'my-url.com';

        const sign = {
          mediaUrl: mediaUrl,
          mnemonic: '',
          senseIds: [] // required
        };

        const query = `
          mutation {
            createSignWithAssociations(
              createSignData: ${jsonGqlString(sign)}
            ) {
              mnemonic
              mediaUrl
            }
          }
        `;

        return request(server)
          .post('/graphql')
          .set('Authorization', 'bearer ' + token)
          .send({
            operationName: null,
            query: query
          })
          .expect(({ body }) => {
            expect(body.errors.length).toBeTruthy();
          });
      });
    });
  });
});
