import { TestingModule, Test } from '@nestjs/testing';
import { TestDatabaseModule } from '../config/test-database.module';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { ReferenceService } from './reference.service';

describe('ReferenceService', () => {
  let service: ReferenceService;
  // let entrySearchesService: EntrySearchesService;
  // let thesaurusSearchesService: ThesaurusSearchesService;
  // let sensesService: SensesService;
  // let entrySensesService: EntrySensesService;
  // let similarityService: SimilarityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule
        // MongooseModule.forFeature([
        //   { name: ENTRY_COLLECTION_NAME, schema: EntrySchema }
        // ])
      ],
      providers: [ReferenceService]
    }).compile();

    //   entriesService = module.get<EntriesService>(EntriesService);
    //   entrySearchesService = module.get<EntrySearchesService>(
    //     EntrySearchesService
    //   );
    //   thesaurusSearchesService = module.get<ThesaurusSearchesService>(
    //     ThesaurusSearchesService
    //   );
    service = module.get<ReferenceService>(ReferenceService);
    //   entrySensesService = module.get<EntrySensesService>(EntrySensesService);
    //   similarityService = module.get<SimilarityService>(SimilarityService);
  });

  it('does something', () => {
    console.log('foo');
  });
});

// // }}))
