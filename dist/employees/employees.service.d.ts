import { Model } from 'mongoose';
import { Employee } from './schema/employee.schema';
import { ChangeCompanyPasswordDto } from 'src/company/dto/change-company-password.dto';
import { Company } from 'src/company/schema/company.schema';
import { File } from 'src/file/schema/file.schema';
import { AwsService } from 'src/aws/aws.service';
export declare class EmployeesService {
    private awsService;
    private readonly employeeModel;
    private readonly companyModel;
    private readonly fileModel;
    constructor(awsService: AwsService, employeeModel: Model<Employee>, companyModel: Model<Company>, fileModel: Model<File>);
    remove(employeeId: string): Promise<{
        message: string;
        deletedEmployee: (import("mongoose").Document<unknown, {}, Employee, {}> & Employee & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }) | null;
    }>;
    changePassword(employeeId: string, dto: ChangeCompanyPasswordDto): Promise<{
        message: string;
    }>;
}
