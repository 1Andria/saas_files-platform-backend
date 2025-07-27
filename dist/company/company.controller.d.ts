import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';
import { RemoveEmployeeDto } from './dto/remove-employee.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("./schema/company.schema").Company, {}> & import("./schema/company.schema").Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./schema/company.schema").Company, {}> & import("./schema/company.schema").Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, import("./schema/company.schema").Company, "find", {}>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schema/company.schema").Company, {}> & import("./schema/company.schema").Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    changeSubscription(companyId: string): Promise<{
        message: string;
        subscription: {
            plan: string;
            activatedAt: null;
        };
    }>;
    changePassword(companyId: string, dto: ChangeCompanyPasswordDto): Promise<{
        message: string;
    }>;
    update(companyId: string, updateCompanyDto: UpdateCompanyDto): Promise<{
        message: string;
        updatedCompany: import("mongoose").Document<unknown, {}, import("./schema/company.schema").Company, {}> & import("./schema/company.schema").Company & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    deleteFileByCompany(fileId: string, companyId: string): Promise<{
        message: string;
        fileId: string;
    }>;
    removeEmployee(companyId: string, body: RemoveEmployeeDto): Promise<{
        message: string;
    }>;
    remove(companyId: string): Promise<{
        message: string;
        deletedCompany: (import("mongoose").Document<unknown, {}, import("./schema/company.schema").Company, {}> & import("./schema/company.schema").Company & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }) | null;
    }>;
}
