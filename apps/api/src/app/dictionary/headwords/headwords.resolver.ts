// https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { HeadwordsService } from './headwords.service';
import { HeadwordDto } from './dto/headword.dto';
import { NotFoundException } from '@nestjs/common';

@Resolver('Headwords')
export class HeadwordsResolver {
  constructor(private readonly headwordsService: HeadwordsService) {}

  @Query(() => String)
  async hello() {
    return 'hello there people!';
  }

  @Query(returns => HeadwordDto)
  async headword(@Args('id') id: string): Promise<HeadwordDto> {
    const headword = await this.headwordsService.findOneById(id);
    if (!headword) {
      throw new NotFoundException(id);
    }
    return headword;
  }

  @Query(returns => [HeadwordDto])
  headwordsAll(): Promise<HeadwordDto[]> {
    return this.headwordsService.findAll();
  }

  @Query(returns => [HeadwordDto])
  search(@Args('search_string') search_string: string): Promise<HeadwordDto[]> {
    return this.headwordsService.search(search_string);
  }
}
