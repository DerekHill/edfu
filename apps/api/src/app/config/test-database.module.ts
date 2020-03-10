// https://github.com/nestjs/mongoose/issues/13#issuecomment-525909718
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MONGOOSE_OPTIONS } from './mongoose-deprecations';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongod = new MongoMemoryServer();
        const uri = await mongod.getConnectionString();
        return { uri: uri, ...MONGOOSE_OPTIONS };
      }
    })
  ]
})
export class TestDatabaseModule {}
