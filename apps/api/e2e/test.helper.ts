import * as request from 'supertest';

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
          throw new Error('Empty access_token!');
        }

        return res.body.access_token;
      },
      (err: any) => console.log('Error logging in', err)
    );
}
