import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConsoleModule } from 'nestjs-console';
import { MongooseModule } from '@nestjs/mongoose';
import { OxfordApiModule } from './oxford-api/oxford-api.module';
import { TaskModule } from './tasks/task.module';
import { ReferenceModule } from './reference/reference.module';
import { MONGOOSE_OPTIONS } from './config/mongoose-deprecations';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { environment } from '../environments/environment';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { TranscodeModule } from './transcode/transcode.module';
import { SPA_DIR } from './config/spa-version';
import { SocialModule } from './social/social.module';

const CONFIG_CONFIG =
  process.env.TRAVIS === 'true'
    ? {
        ignoreEnvFile: true
      }
    : {};

const imports = [
  ConfigModule.forRoot(CONFIG_CONFIG),
  ConsoleModule,
  TaskModule,
  MongooseModule.forRoot(process.env.MONGODB_URI, MONGOOSE_OPTIONS),
  GraphQLModule.forRoot({
    autoSchemaFile: 'schema.gql',
    context: ({ req }) => ({ req }),
    formatError: error => {
      console.error('Error', error);
      return error;
    }
  }),
  OxfordApiModule,
  ReferenceModule,
  AuthModule,
  UsersModule,
  SocialModule
];

if (environment.production) {
  imports.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', SPA_DIR),
      exclude: ['/graphql*']
    })
  );
}

if (process.env.IS_WORKER_PROCESS_TYPE === 'yes') {
  imports.push(TranscodeModule);
}

@Module({
  imports: imports,
  controllers: [AuthController]
})
export class AppModule {}
