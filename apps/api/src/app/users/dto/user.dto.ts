import { BasicUser } from '@edfu/api-interfaces';

export class UserDto implements BasicUser {
  readonly email: string;
  readonly username: string;
  readonly roles: string[];
}
