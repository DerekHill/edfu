import { IsString, IsNotEmpty } from 'class-validator';
import { SignParams } from '@edfu/api-interfaces';

export class CreateSignDto implements Omit<SignParams, 'userId' | 's3KeyOrig'> {
  @IsString()
  mnemonic?: string;

  @IsNotEmpty()
  @IsString({
    each: true
  })
  senseIds: string[];
}
