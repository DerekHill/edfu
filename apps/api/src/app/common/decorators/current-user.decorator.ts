import { createParamDecorator } from '@nestjs/common';

export const CurrentUserGraphQl = createParamDecorator(
  (data, [root, args, ctx, info]) => ctx.req.user
);

export const CurrentUserRest = createParamDecorator((_, req) => req.user);
