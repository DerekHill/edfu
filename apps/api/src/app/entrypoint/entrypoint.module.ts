import { Module } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
import { OxfordApiModule } from '../oxford-api/oxford-api.module';
import { FixturesService } from './fixtures/fixtures.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME, SENSE_COLLECTION_NAME } from '../constants';
import { HeadwordSchema } from '../dictionary/headwords/schemas/headword.schema';
import { SenseSchema } from '../dictionary/senses/schemas/sense.schema';

@Module({
  imports: [
    OxfordApiModule,
    MongooseModule.forFeature([
      { name: HEADWORD_COLLECTION_NAME, schema: HeadwordSchema },
      { name: SENSE_COLLECTION_NAME, schema: SenseSchema }
    ])
  ],
  controllers: [],
  providers: [EntrypointService, FixturesService],
  exports: []
})
export class EntrypointModule {}
