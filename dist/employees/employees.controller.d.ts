import { EmployeesService } from './employees.service';
import { ChangeCompanyPasswordDto } from 'src/company/dto/change-company-password.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    changePassword(employeeId: string, dto: ChangeCompanyPasswordDto): Promise<{
        message: string;
    }>;
    remove(employeeId: string): Promise<{
        message: string;
        deletedEmployee: (import("mongoose").Document<unknown, {}, import("./schema/employee.schema").Employee, {}> & import("./schema/employee.schema").Employee & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }) | null;
    }>;
}
