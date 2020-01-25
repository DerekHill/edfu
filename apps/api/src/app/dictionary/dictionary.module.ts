import { Module } from '@nestjs/common';
import { HeadwordsService } from './headwords/headwords.service';
import { OxfordSearchesModule } from '../oxford-searches/oxford-searches.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME, SENSE_COLLECTION_NAME } from '../constants';
import { HeadwordSchema } from './headwords/schemas/headword.schema';
import { SensesService } from './senses/senses.service';
import { HeadwordsResolver } from './headwords/headwords.resolver';
import { SenseSchema } from './senses/schemas/sense.schema';
import { SensesResolver } from './senses/senses.resolver';

@Module({
  imports: [
    OxfordSearchesModule,
    MongooseModule.forFeature([
      { name: HEADWORD_COLLECTION_NAME, schema: HeadwordSchema }
    ]),
    MongooseModule.forFeature([
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
    ])
  ],
  providers: [
    HeadwordsService,
    SensesService,
    HeadwordsResolver,
    SensesResolver
  ]
})
export class DictionaryModule {}
