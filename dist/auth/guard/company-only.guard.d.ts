import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class CompanyOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
