import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { OxfordApiModule } from '../oxford-api/oxford-api.module';
import { FixturesService } from './fixtures/fixtures.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../constants';
import { EntrySchema } from '../reference/entries/schemas/entry.schema';
import { SenseSchema } from '../reference/senses/schemas/sense.schema';
import { EntrySenseSchema } from '../reference/entry-senses/schemas/entry-sense.schema';
import { LoaderService } from './loader/loader.service';
import { ReferenceModule } from '../reference/reference.module';
import { SenseSignSchema } from '../reference/signs/schemas/sense-sign.schema';
import { SignSchema } from '../reference/signs/schemas/sign.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    OxfordApiModule,
    MongooseModule.forFeature([
      { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
      { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema },
      { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema },
      { name: SIGN_COLLECTION_NAME, schema: SignSchema }
    ]),
    ReferenceModule,
    UsersModule
  ],
  controllers: [],
  providers: [TaskService, FixturesService, LoaderService],
  exports: []
})
export class TaskModule {}
