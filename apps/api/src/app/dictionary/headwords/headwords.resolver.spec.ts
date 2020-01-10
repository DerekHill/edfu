import { Test, TestingModule } from '@nestjs/testing';
import { HeadwordsResolver } from './headwords.resolver';
import { HeadwordsService } from './headwords.service';
import { HeadwordRecord } from './interfaces/headword.interface';
import { ObjectId } from 'bson';

export class HeadwordsServiceMock {
  findOneById(id: string): Promise<HeadwordRecord> {
    return Promise.resolve(null);
  }
  search(chars: string): Promise<HeadwordRecord[]> {
    return Promise.resolve(null);
  }
}

const headwordRecord = (wordAndOxId: string): HeadwordRecord => {
  return {
    _id: new ObjectId(),
    oxId: wordAndOxId,
    homographC: null,
    word: wordAndOxId,
    topLevel: true,
    ownSenseIds: [],
    synonymSenseIds: []
  };
};

describe('HeadwordsResolver', () => {
  let resolver: HeadwordsResolver;
  let headwordsService: HeadwordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadwordsResolver,
        {
          provide: HeadwordsService,
          useClass: HeadwordsServiceMock
        }
      ]
    }).compile();

    resolver = module.get<HeadwordsResolver>(HeadwordsResolver);
    headwordsService = module.get<HeadwordsService>(HeadwordsService);
  });

  it('finds object by id', async () => {
    const oxId = 'food';
    const headword = headwordRecord(oxId);

    jest.spyOn(headwordsService, 'findOneById').mockImplementation(() => {
      return Promise.resolve(headword);
    });

    const res = await resolver.headword('id');

    expect(res.oxId).toEqual(oxId);
  });

  it('searches by search_string', async () => {
    const word = 'food';
    const headword = headwordRecord(word);
    jest.spyOn(headwordsService, 'search').mockImplementation(() => {
      return Promise.resolve([headword]);
    });
    const res = await resolver.search('foo');
    expect(res[0].word).toEqual(word);
  });
});
