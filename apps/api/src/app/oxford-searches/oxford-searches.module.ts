import { Module } from '@nestjs/common';
import {
  BaseSearchesService,
  EntrySearchesService,
  ThesaurusSearchesService,
} from './oxford-searches.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ENTRY_SEARCH_COLLECTION_NAME,
  THESAURUS_SEARCH_COLLECTION_NAME,
} from '../constants';
import { OxfordSearchSchema } from './schemas/oxford-search.schema';
import { OxfordApiModule } from '../oxford-api/oxford-api.module';

@Module({
  imports: [
    OxfordApiModule,
    MongooseModule.forFeature([
      { name: ENTRY_SEARCH_COLLECTION_NAME, schema: OxfordSearchSchema },
      { name: THESAURUS_SEARCH_COLLECTION_NAME, schema: OxfordSearchSchema },
    ]),
  ],
  controllers: [],
  providers: [
    BaseSearchesService,
    EntrySearchesService,
    ThesaurusSearchesService,
  ],
  exports: [
    MongooseModule,
    BaseSearchesService,
    EntrySearchesService,
    ThesaurusSearchesService,
  ],
})
export class OxfordSearchesModule {}
