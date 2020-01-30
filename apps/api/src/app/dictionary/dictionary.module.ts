import { Module } from '@nestjs/common';
import { EntriesService } from './entries/entries.service';
import { OxfordSearchesModule } from '../oxford-searches/oxford-searches.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../constants';
import { EntrySchema } from './entries/schemas/entry.schema';
import { SensesService } from './senses/senses.service';
import { EntriesResolver } from './entries/entries.resolver';
import { SenseSchema } from './senses/schemas/sense.schema';
import { SensesResolver } from './senses/senses.resolver';
import { SignsService } from './signs/signs.service';
import { SignSchema } from './signs/schemas/sign.schema';

@Module({
  imports: [
    OxfordSearchesModule,
    MongooseModule.forFeature([
      { name: ENTRY_COLLECTION_NAME, schema: EntrySchema }
    ]),
    MongooseModule.forFeature([
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
    ]),
    MongooseModule.forFeature([
      { name: SIGN_COLLECTION_NAME, schema: SignSchema }
    ])
  ],
  providers: [
    EntriesService,
    SensesService,
    EntriesResolver,
    SensesResolver,
    SignsService
  ]
})
export class DictionaryModule {}
