import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { SharedSenseRecordWithoutId } from '../interfaces/sense.interface';

@ObjectType()
export class SensePureDto implements SharedSenseRecordWithoutId {
  @Field()
  readonly ownEntryOxId: string;
  @Field()
  readonly ownEntryHomographC: number;
  @Field(type => ID)
  readonly senseId: string;
  @Field(type => LexicalCategory)
  readonly lexicalCategory: LexicalCategory;
  @Field()
  readonly apiSenseIndex: number;
  @Field({ nullable: true })
  readonly example: string;
  @Field(type => DictionaryOrThesaurus)
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
}
