import * as request from 'supertest';
import { CreateUserDto } from '../src/app/users/dto/create-user.dto';

export const TEST_USER: CreateUserDto = {
  username: 'fred',
  email: 'fred@gmail.com',
  password: '12345'
};

export async function login(email, password, server: any): Promise<string> {
  return request(server)
    .post('/auth/login')
    .send({ email: email, password: password })
    .then(
      (res: any) => {
        if (res.body === 'User not found') {
          throw new Error(res.body);
        }

        if (!res.body.access_token) {
          console.error(res.body);
          throw new Error('Empty access_token!');
        }

        return res.body.access_token;
      },
      (err: any) => console.log('Error logging in', err)
    );
}

export const registerUser = (server: any, user: CreateUserDto) => {
  return request(server)
    .post('/auth/register')
    .send(user);
};
