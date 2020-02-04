// https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
import { Resolver, Query, Args, Root, ResolveProperty } from '@nestjs/graphql';
import {
  EntrySenseDto,
  SenseDto,
  DictionaryOrThesaurus,
  LexicalCategory
} from '@edfu/api-interfaces';
import { EntrySensesService } from './entry-senses.service';
import { FieldResolver, ResolverInterface } from 'type-graphql';
import { ObjectId } from 'bson';
import { SensesService } from '../senses/senses.service';

interface EntryId {
  oxId: string;
  homographC: number;
}

// @Resolver('EntrySenses')
@Resolver(of => EntrySenseDto)
export class EntrySensesResolver implements ResolverInterface<EntrySenseDto> {
  constructor(
    private readonly entrySensesService: EntrySensesService,
    private readonly sensesService: SensesService
  ) {}

  @Query(returns => [EntrySenseDto])
  entrySenses(
    @Args('oxId') oxId: string,
    @Args('homographC') homographC: number
  ): Promise<EntrySenseDto[]> {
    return this.entrySensesService.findByEntryProperties(oxId, homographC);
  }

  @ResolveProperty()
  async sense(@Root() es: EntrySenseDto) {
    // return Promise.resolve({
    // console.log('here we are!!');
    // console.log(this.entrySensesService);
    // console.log(this.sensesService);

    const foo = await this.sensesService.findOne(es.senseId);
    console.log('es.senseId', es.senseId);
    console.log(foo);
    // console.log(this.sensesService);
    return foo;
    // return {
    //   _id: new ObjectId(),
    //   senseId: 'id',
    //   entryOxId: 'fooo',
    //   entryHomographC: 0,
    //   dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    //   thesaurusSenseIds: [],
    //   lexicalCategory: LexicalCategory.noun,
    //   example: 'we need food and water',
    //   definition: 'any nutritious substance'
    // };
  }
}
