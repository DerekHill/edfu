import { InputType, Field } from 'type-graphql';
import { CreateSignInputInterface } from '@edfu/api-interfaces';

@InputType()
export class CreateSignInput implements CreateSignInputInterface {
  @Field()
  mnemonic: string;

  @Field()
  mediaUrl: string;

  @Field()
  s3Key: string;

  @Field(type => [String])
  readonly senseIds: string[];
}
