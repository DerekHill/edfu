import { Test, TestingModule } from '@nestjs/testing';
import { EntriesResolver } from './entries.resolver';
import { EntriesService } from './entries.service';
import { EntryRecord } from './interfaces/entry.interface';
import { ObjectId } from 'bson';
import { HeadwordOrPhrase } from '../../enums';

export class EntriesServiceMock {
  findOneById(id: string): Promise<EntryRecord> {
    return Promise.resolve(null);
  }
  search(chars: string): Promise<EntryRecord[]> {
    return Promise.resolve(null);
  }
}

const entryRecord = (wordAndOxId: string): EntryRecord => {
  return {
    _id: new ObjectId(),
    oxId: wordAndOxId,
    homographC: 0,
    word: wordAndOxId,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  };
};

describe('EntriesResolver', () => {
  let resolver: EntriesResolver;
  let entriesService: EntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesResolver,
        {
          provide: EntriesService,
          useClass: EntriesServiceMock
        }
      ]
    }).compile();

    resolver = module.get<EntriesResolver>(EntriesResolver);
    entriesService = module.get<EntriesService>(EntriesService);
  });

  it('finds object by id', async () => {
    const oxId = 'food';
    const entry = entryRecord(oxId);

    jest.spyOn(entriesService, 'findOneById').mockImplementation(() => {
      return Promise.resolve(entry);
    });

    const res = await resolver.entry('id');

    expect(res.oxId).toEqual(oxId);
  });

  it('searches by search_string', async () => {
    const word = 'food';
    const entry = entryRecord(word);
    jest.spyOn(entriesService, 'search').mockImplementation(() => {
      return Promise.resolve([entry]);
    });
    const res = await resolver.search('foo');
    expect(res[0].word).toEqual(word);
  });
});
