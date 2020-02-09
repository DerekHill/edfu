import { Module } from '@nestjs/common';
import { EntriesService } from './entries/entries.service';
import { OxfordSearchesModule } from '../oxford-searches/oxford-searches.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  SIGN_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  TF_MODEL_NAME
} from '../constants';
import { EntrySchema } from './entries/schemas/entry.schema';
import { SensesService } from './senses/senses.service';
import { EntriesResolver } from './entries/entries.resolver';
import { SenseSchema } from './senses/schemas/sense.schema';
import { SensesResolver } from './senses/senses.resolver';
import { SignsService } from './signs/signs.service';
import { SignSchema } from './signs/schemas/sign.schema';
import { EntrySensesService } from './entry-senses/entry-senses.service';
import { EntrySenseSchema } from './entry-senses/schemas/entry-sense.schema';
import { SimilarityService } from './similarity/similarity.service';
import * as use from '@tensorflow-models/universal-sentence-encoder';

class TfUseMock {
  embed(sentences: string[]) {
    return {
      arraySync: () => [[1], [1]]
    };
  }
}

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
    ]),
    MongooseModule.forFeature([
      { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema }
    ])
  ],
  providers: [
    EntriesService,
    SensesService,
    EntriesResolver,
    SensesResolver,
    SignsService,
    EntrySensesService,
    {
      provide: TF_MODEL_NAME,
      useFactory: async () => {
        // SKIP_TENSORFLOW=yes ng run api:serve-console
        // SKIP_TENSORFLOW=yes ng serve api
        if (process.env.SKIP_TENSORFLOW === 'yes') {
          console.warn(
            'Skipping Universal Sentence Encoder Tensorflow model...'
          );
          return new TfUseMock();
        } else {
          console.warn(
            'Loading Universal Sentence Encoder Tensorflow model...'
          );
          return await use.load();
        }
      }
    },
    SimilarityService
  ],
  exports: [EntriesService]
})
export class DictionaryModule {}
