// // https://github.com/nestjs/nest/blob/master/sample/23-type-graphql/src/recipes/recipes.resolver.ts
// import { Resolver, Query, Args, Root, ResolveProperty } from '@nestjs/graphql';
// import {
//   DictionaryOrThesaurus,
//   LexicalCategory
// } from '@edfu/api-interfaces';
// import { EntrySensesService } from './entry-senses.service';
// import { FieldResolver, ResolverInterface } from 'type-graphql';
// import { ObjectId } from 'bson';
// import { SensesService } from '../senses/senses.service';

// interface EntryId {
//   oxId: string;
//   homographC: number;
// }

// @Resolver('EntrySenses')
// @Resolver(of => EntrySenseDto)
// export class EntrySensesResolver implements ResolverInterface<EntrySenseDto> {
//   constructor(
//     private readonly entrySensesService: EntrySensesService,
//     private readonly sensesService: SensesService
//   ) {}

//   @Query(returns => [EntrySenseDto])
//   entrySenses(
//     @Args('oxId') oxId: string,
//     @Args('homographC') homographC: number
//   ): Promise<EntrySenseDto[]> {
//     console.log('entrySenses', oxId, homographC);
//     return this.entrySensesService.findByEntryProperties(oxId, homographC);
//   }

//   @ResolveProperty()
//   async sense(@Root() es: EntrySenseDto) {
//     const foo = await this.sensesService.findOne(es.senseId);
//     return foo;
//   }
// }
