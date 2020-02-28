import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // https://docs.nestjs.com/techniques/logger
    // logger: ['log', 'error', 'warn', 'debug', 'verbose']
    logger: console
  });
  const globalPrefix = 'api';
  //   app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
