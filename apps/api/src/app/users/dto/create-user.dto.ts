import { CreateUserDtoInterface } from '@edfu/api-interfaces';

export class CreateUserDto implements CreateUserDtoInterface {
  readonly username: string;
  readonly email: string;
  password: string;
}
