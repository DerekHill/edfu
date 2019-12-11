// https://github.com/nestjs/mongoose/issues/13#issuecomment-525909718
// Need to worry about having a different instance per test?
// Figure out how to access this to shut it down
// Move to more suitable location?
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongod = new MongoMemoryServer();
        const uri = await mongod.getConnectionString();
        return {
          uri: uri,
        };
      },
    }),
  ],
})
export class TestDatabaseModule {}
