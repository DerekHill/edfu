import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { OxfordApiModule } from '../oxford-api/oxford-api.module';
import { FixturesService } from './fixtures/fixtures.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME
} from '../constants';
import { EntrySchema } from '../dictionary/entries/schemas/entry.schema';
import { SenseSchema } from '../dictionary/senses/schemas/sense.schema';
import { EntrySenseSchema } from '../dictionary/entry-senses/schemas/entry-sense.schema';

@Module({
  imports: [
    OxfordApiModule,
    MongooseModule.forFeature([
      { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
      { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema }
    ])
  ],
  controllers: [],
  providers: [TaskService, FixturesService],
  exports: []
})
export class TaskModule {}
