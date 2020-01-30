import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsoleModule } from 'nestjs-console';
import { MongooseModule } from '@nestjs/mongoose';
import { OxfordApiModule } from './oxford-api/oxford-api.module';
import { ConfigModule } from './config/config.module';
import { EntrypointModule } from './tasks/task.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { MONGOOSE_OPTIONS } from './config/mongoose-deprecations';

@Module({
  imports: [
    ConsoleModule,
    ConfigModule,
    EntrypointModule,
    MongooseModule.forRoot('mongodb://localhost/edfu', MONGOOSE_OPTIONS),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql'
    }),
    OxfordApiModule,
    DictionaryModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
