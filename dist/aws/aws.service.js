"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
let AwsService = class AwsService {
    bucketName;
    s3;
    constructor() {
        this.bucketName = process.env.MY_AWS_BUCKET_NAME;
        this.s3 = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: process.env.MY_AWS_ACCESS_KEY,
                secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
            },
            region: process.env.MY_AWS_REGION,
        });
    }
    async uploadFile(fileId, file) {
        if (!fileId || !file)
            throw new common_1.BadRequestException('file is required');
        const config = {
            Key: fileId,
            Body: file.buffer,
            Bucket: this.bucketName,
            ContentType: file.mimetype,
        };
        const uploadCommand = new client_s3_1.PutObjectCommand(config);
        await this.s3.send(uploadCommand);
        return fileId;
    }
    async deleteFileById(fileId) {
        if (!fileId)
            throw new common_1.BadRequestException('fileId is required');
        const config = {
            Key: fileId,
            Bucket: this.bucketName,
        };
        const deleteCommand = new client_s3_1.DeleteObjectCommand(config);
        await this.s3.send(deleteCommand);
        return fileId;
    }
};
exports.AwsService = AwsService;
exports.AwsService = AwsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AwsService);
//# sourceMappingURL=aws.service.js.map