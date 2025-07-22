import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { id, role } = request.user;

    if (!id || !role) {
      throw new Error('Invalid token: missing id or role');
    }

    return { id, role };
  },
);
