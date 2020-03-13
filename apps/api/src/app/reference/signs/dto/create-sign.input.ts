import { InputType, Field } from 'type-graphql';
import { BasicSignRecord } from '@edfu/api-interfaces';

@InputType()
export class CreateSignInput implements BasicSignRecord {
  @Field()
  mnemonic: string;
  @Field()
  mediaUrl: string;
}
