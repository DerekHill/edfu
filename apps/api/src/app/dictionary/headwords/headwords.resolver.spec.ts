import { Test, TestingModule } from '@nestjs/testing';
import { HeadwordsResolver } from './headwords.resolver';
import { HeadwordsService } from './headwords.service';
import { HeadwordRecord } from './interfaces/headword.interface';
import { ObjectId } from 'bson';

export class HeadwordsServiceMock {
  findOneById(id: string): Promise<HeadwordRecord> {
    return Promise.resolve(null);
  }
}

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
    const word: HeadwordRecord = {
      _id: new ObjectId(),
      oxId: oxId,
      homographC: null,
      word: 'food',
      topLevel: true,
      ownSenseIds: [],
      synonymSenseIds: []
    };

    jest.spyOn(headwordsService, 'findOneById').mockImplementation(() => {
      return Promise.resolve(word);
    });

    const res = await resolver.headword('id');

    expect(res.oxId).toEqual(oxId);
  });
});
