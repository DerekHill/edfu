import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSignDto {
  @IsString()
  mnemonic?: string;

  @IsNotEmpty()
  @IsString({
    each: true
  })
  senseIds: string[];
}
