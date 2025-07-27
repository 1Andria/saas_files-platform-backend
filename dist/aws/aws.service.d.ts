export declare class AwsService {
    private bucketName;
    private s3;
    constructor();
    uploadFile(fileId: any, file: any): Promise<any>;
    deleteFileById(fileId: string): Promise<string>;
}
