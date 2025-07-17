import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const EmployeeId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.role !== 'employee') {
      throw new ForbiddenException('Access denied: Only employees allowed');
    }
    return request.user.id;
  },
);
