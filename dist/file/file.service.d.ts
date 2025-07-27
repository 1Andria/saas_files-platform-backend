import { AwsService } from 'src/aws/aws.service';
import mongoose, { Model, Types } from 'mongoose';
import { File } from './schema/file.schema';
import { Employee } from 'src/employees/schema/employee.schema';
import { Company } from 'src/company/schema/company.schema';
export declare class FileService {
    private awsService;
    private readonly fileModel;
    private readonly employeeModel;
    private readonly companyModel;
    constructor(awsService: AwsService, fileModel: Model<File>, employeeModel: Model<Employee>, companyModel: Model<Company>);
    uploadFileByEmployee(file: Express.Multer.File, employeeId: string, visibleTo?: string[]): Promise<{
        message: string;
        file: {
            fileName: string;
            url: string;
        };
    }>;
    deleteFile(fileId: string, employeeId: string): Promise<{
        message: string;
        fileId: string;
    }>;
    getFilesForEmployee(employeeId: string): Promise<{
        files: (mongoose.Document<unknown, {}, File, {}> & File & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    updateFilePermissions(fileId: string, employeeId: string, visibleTo?: string[]): Promise<{
        message: string;
        whoCanSee?: undefined;
    } | {
        message: string;
        whoCanSee: string[];
    }>;
}
