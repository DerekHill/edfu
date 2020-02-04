import { TestingModule, Test } from '@nestjs/testing';
import { SensesResolver } from './senses.resolver';
import { SensesService } from './senses.service';
import {
  DictionarySenseRecord,
  ThesaurusSenseRecord
} from './interfaces/sense.interface';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

export class SensesServiceMock {
  findOne(
    senseId: string
  ): Promise<DictionarySenseRecord | ThesaurusSenseRecord> {
    return Promise.resolve(null);
  }
  findMany(
    senseId: string
  ): Promise<DictionarySenseRecord[] | ThesaurusSenseRecord[]> {
    return Promise.resolve(null);
  }
}

const senseRecordFactory = (): DictionarySenseRecord => {
  return {
    _id: new ObjectId(),
    senseId: 'id',
    entryOxId: 'food',
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    definition: 'foo',
    example: 'bar',
    lexicalCategory: LexicalCategory.noun
  };
};

describe('SensesResolver', () => {
  let resolver: SensesResolver;
  let sensesService: SensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensesResolver,
        {
          provide: SensesService,
          useClass: SensesServiceMock
        }
      ]
    }).compile();

    resolver = module.get<SensesResolver>(SensesResolver);
    sensesService = module.get<SensesService>(SensesService);
  });

  it('finds object by id', async () => {
    const entryOxId = 'food';
    const sense = senseRecordFactory();

    jest.spyOn(sensesService, 'findOne').mockImplementation(() => {
      return Promise.resolve(sense);
    });

    const res = await resolver.sense('id');

    expect(res.entryOxId).toEqual(entryOxId);
  });

  it('finds objects by ids', async () => {
    jest.spyOn(sensesService, 'findMany').mockImplementation(() => {
      const senses = [senseRecordFactory(), senseRecordFactory()];
      return Promise.resolve(senses);
    });

    const res = await resolver.senses(['id1', 'id2']);
    expect(res.length).toBe(2);
  });
});
