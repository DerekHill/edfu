import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import Arena from 'bull-arena';
import { TRANSCODE_QUEUE_NAME } from './app/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console
  });

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
          }
        ]
      },
      {
        basePath: '/',
        disableListen: true
      }
    )
  );

  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    console.log('Listening...');
  });
}

bootstrap();
