import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../interfaces/user.interface';

/**
 * Decorator para obtener el usuario actual del request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
