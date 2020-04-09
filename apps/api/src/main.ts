import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import Arena from 'bull-arena';
import { TRANSCODE_QUEUE_NAME, OXFORD_API_QUEUE_NAME } from './app/constants';
import { SPA_VERSION } from './app/config/spa-version';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console
  });

  if (process.env.IS_WEB_PROCESS_TYPE === 'yes') {
    app.enableCors();

    app.use(
      '/bull-arena',
      Arena(
        {
          queues: [
            {
              name: TRANSCODE_QUEUE_NAME,
              hostId: 'worker',
              redis: process.env.REDIS_URL
            },
            {
              name: OXFORD_API_QUEUE_NAME,
              hostId: 'worker',
              redis: process.env.REDIS_URL
            }
          ]
        },
        {
          basePath: '/',
          disableListen: true
        }
      )
    );

    app.use((req, res, next) => {
      res.header('SERVER_VERSION', SPA_VERSION);
      next();
    });
  }
  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

bootstrap();
