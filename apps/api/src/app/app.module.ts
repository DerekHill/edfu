import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

const CONFIG_CONFIG =
  process.env.TRAVIS === 'true'
    ? {
        ignoreEnvFile: true
      }
    : {};

const imports = [
  ConsoleModule,
  ConfigModule.forRoot(CONFIG_CONFIG),
  TaskModule,
  MongooseModule.forRoot(process.env.MONGODB_URI, MONGOOSE_OPTIONS),
  GraphQLModule.forRoot({
    autoSchemaFile: 'schema.gql'
  }),
  OxfordApiModule,
  ReferenceModule,
  AuthModule,
  UsersModule
];

if (environment.production) {
  imports.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'dist/apps/erya')
    })
  );
}

@Module({
  imports: imports,
  controllers: [AppController, AuthController],
  providers: [AppService]
})
export class AppModule {}
