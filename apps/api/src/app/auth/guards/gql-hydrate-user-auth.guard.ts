// This is similar to GqlPassportAuthGuard. It is slower because it makes a database call but
// has the advantage of adding a BasicUser to the request.

// If we are confident to drop Passport we could DRY this out by dropping GqlPassportAuthGuard,
// and adding a parameter on instantiation of this guard whether it should hydrate the user.

// https://docs.nestjs.com/guards#binding-guards
// https://stackoverflow.com/a/55561022/1450420
// https://github.com/nestjs/graphql/issues/48#issuecomment-606361795

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlHydrateUserAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const authHeader = req.headers.authorization as string;
    if (!authHeader) {
      throw new BadRequestException('Authorization header not found.');
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new BadRequestException(
        `Authentication type \'Bearer\' required. Found \'${type}\'`
      );
    }
    const user = await this.authService.validateTokenAndFetchUser(token);
    if (user) {
      req.user = user;
      return true;
    }
    throw new UnauthorizedException('Token not valid');
  }
}
