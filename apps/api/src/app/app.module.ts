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

const CONFIG_CONFIG =
  process.env.TRAVIS === 'true'
    ? {
        ignoreEnvFile: true
      }
    : {};

@Module({
  imports: [
    ConsoleModule,
    ConfigModule.forRoot(CONFIG_CONFIG),
    TaskModule,
    MongooseModule.forRoot(process.env.MONGODB_URI, MONGOOSE_OPTIONS),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql'
    }),
    OxfordApiModule,
    ReferenceModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'dist/apps/erya')
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
