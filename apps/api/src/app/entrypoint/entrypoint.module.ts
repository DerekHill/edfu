import { Module } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
// import { OxfordApiModule } from "../oxford-api/oxford-api.module";
// import { OxfordSearchesModule } from "../oxford-searches/oxford-searches.module";
import { FixturesService } from './fixtures/fixtures.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME } from '../constants';
import { HeadwordSchema } from '../dictionary/headwords/schemas/headword.schema';

@Module({
  imports: [
    // OxfordApiModule,
    // OxfordSearchesModule,
    MongooseModule.forFeature([
      { name: HEADWORD_COLLECTION_NAME, schema: HeadwordSchema }
    ])
  ],
  controllers: [],
  providers: [EntrypointService, FixturesService],
  exports: []
})
export class EntrypointModule {}
