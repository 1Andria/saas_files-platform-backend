import { FileService } from './file.service';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    uploadFile(file: Express.Multer.File, employeeId: string, visibleTo: string[]): Promise<{
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
    getEmployeeFiles(employeeId: string): Promise<{
        files: (import("mongoose").Document<unknown, {}, import("./schema/file.schema").File, {}> & import("./schema/file.schema").File & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    updateFilePermissions(fileId: string, visibleTo: string[], employeeId: string): Promise<{
        message: string;
        whoCanSee?: undefined;
    } | {
        message: string;
        whoCanSee: string[];
    }>;
}
