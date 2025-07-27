import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class EmployeeOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
