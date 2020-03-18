import { Module } from '@nestjs/common';
import { EntriesService } from './entries/entries.service';
import { OxfordSearchesModule } from '../oxford-searches/oxford-searches.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  SIGN_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  TF_MODEL_NAME,
  SENSE_SIGN_COLLECTION_NAME
} from '../constants';
import { EntrySchema } from './entries/schemas/entry.schema';
import { SensesService } from './senses/senses.service';
import { EntriesResolver } from './entries/entries.resolver';
import { SenseSchema } from './senses/schemas/sense.schema';
import { SignsService } from './signs/signs.service';
import { SignSchema } from './signs/schemas/sign.schema';
import { EntrySensesService } from './entry-senses/entry-senses.service';
import { EntrySenseSchema } from './entry-senses/schemas/entry-sense.schema';
import { SimilarityService } from './similarity/similarity.service';
import { SenseSignSchema } from './signs/schemas/sense-sign.schema';
import {
  DictionaryResolver,
  SignsResolver,
  TestResolver
} from './reference.resolver';
import { ReferenceService } from './reference.service';
import { LexicographerResolver } from './lexicographer.resolver';
import { UsersModule } from '../users/users.module';
import { S3Service } from '../s3/s3.service';
import { S3Module } from '../s3/s3.module';
import { VimeoModule } from '../vimeo/vimeo.module';

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
    UsersModule,
    MongooseModule.forFeature([
      { name: ENTRY_COLLECTION_NAME, schema: EntrySchema },
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema },
      { name: ENTRY_SENSE_COLLECTION_NAME, schema: EntrySenseSchema },
      { name: SENSE_SIGN_COLLECTION_NAME, schema: SenseSignSchema },
      { name: SIGN_COLLECTION_NAME, schema: SignSchema }
    ]),
    S3Module,
    VimeoModule
  ],
  providers: [
    EntriesService,
    ReferenceService,
    SensesService,
    DictionaryResolver,
    LexicographerResolver,
    SignsResolver,
    TestResolver,
    EntriesResolver,
    SignsService,
    EntrySensesService,
    S3Service,
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
          const use = await import(
            '@tensorflow-models/universal-sentence-encoder'
          );
          return await use.load();
        }
      }
    },
    SimilarityService
  ],
  exports: [EntriesService, SensesService, S3Service]
})
export class ReferenceModule {}
