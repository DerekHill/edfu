import { Module } from '@nestjs/common';
import { EntrypointService } from './task.service';
import { OxfordApiModule } from '../oxford-api/oxford-api.module';
import { FixturesService } from './fixtures/fixtures.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ENTRY_COLLECTION_NAME, SENSE_COLLECTION_NAME } from '../constants';
import { EntrySchema } from '../dictionary/entries/schemas/entry.schema';
import { SenseSchema } from '../dictionary/senses/schemas/sense.schema';

@Module({
  imports: [
    OxfordApiModule,
    MongooseModule.forFeature([
      { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
    ])
  ],
  controllers: [],
  providers: [EntrypointService, FixturesService],
  exports: []
})
export class EntrypointModule {}
