import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';
export declare class IsAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly companyModel;
    private readonly employeeModel;
    constructor(jwtService: JwtService, companyModel: Model<Company>, employeeModel: Model<Employee>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getTokenFromHeaders;
}
