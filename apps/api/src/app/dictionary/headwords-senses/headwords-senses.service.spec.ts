import { Test, TestingModule } from '@nestjs/testing';
import { HeadwordsSensesService } from './headwords-senses.service';

describe('HeadwordsSensesService', () => {
  let service: HeadwordsSensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadwordsSensesService],
    }).compile();

    service = module.get<HeadwordsSensesService>(HeadwordsSensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
