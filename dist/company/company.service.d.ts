import { UpdateCompanyDto } from './dto/update-company.dto';
import { Model, Types } from 'mongoose';
import { Company } from './schema/company.schema';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';
import { Employee } from 'src/employees/schema/employee.schema';
import { File } from 'src/file/schema/file.schema';
import { AwsService } from 'src/aws/aws.service';
export declare class CompanyService {
    private awsService;
    private readonly fileModel;
    private readonly companyModel;
    private readonly employeeModel;
    constructor(awsService: AwsService, fileModel: Model<File>, companyModel: Model<Company>, employeeModel: Model<Employee>);
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Company, {}> & Company & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, Company, {}> & Company & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, Company, "find", {}>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Company, {}> & Company & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    changePassword(companyId: string, dto: ChangeCompanyPasswordDto): Promise<{
        message: string;
    }>;
    update(companyId: string, { country, industry, name }: UpdateCompanyDto): Promise<{
        message: string;
        updatedCompany: import("mongoose").Document<unknown, {}, Company, {}> & Company & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    remove(companyId: string): Promise<{
        message: string;
        deletedCompany: (import("mongoose").Document<unknown, {}, Company, {}> & Company & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }) | null;
    }>;
    deleteFileByCompany(fileId: string, companyId: string): Promise<{
        message: string;
        fileId: string;
    }>;
    deleteEmployee(employeeId: string, companyId: string): Promise<{
        message: string;
    }>;
    subscriptionDowngrade(companyId: string): Promise<{
        message: string;
        subscription: {
            plan: string;
            activatedAt: null;
        };
    }>;
}
