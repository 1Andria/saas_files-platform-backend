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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const aws_service_1 = require("../aws/aws.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let FileService = class FileService {
    awsService;
    fileModel;
    employeeModel;
    companyModel;
    constructor(awsService, fileModel, employeeModel, companyModel) {
        this.awsService = awsService;
        this.fileModel = fileModel;
        this.employeeModel = employeeModel;
        this.companyModel = companyModel;
    }
    async uploadFileByEmployee(file, employeeId, visibleTo) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only CSV, XLS, and XLSX files allowed');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileId = `${(0, uuid_1.v4)()}.${fileExt}`;
        await this.awsService.uploadFile(fileId, file);
        const uploader = await this.employeeModel.findById(employeeId);
        if (!uploader)
            throw new common_1.NotFoundException('Employee not found');
        const company = await this.companyModel
            .findById(uploader.company)
            .select('subscription.plan files');
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const plan = company.subscription.plan;
        const currentFilesCount = company.files.length;
        if (plan === 'free' && currentFilesCount >= 10) {
            throw new common_1.BadRequestException('Free plan allows only 10 files');
        }
        if (plan === 'basic' && currentFilesCount >= 100) {
            throw new common_1.BadRequestException('Basic plan allows only 100 files');
        }
        let whoCanSee = [];
        if (visibleTo && visibleTo.length > 0) {
            const filteredEmployees = await this.employeeModel.find({
                employeeEmail: { $in: visibleTo },
                company: company._id,
            });
            if (filteredEmployees.length !== visibleTo.length) {
                throw new common_1.BadRequestException('Some emails are invalid or not in the company');
            }
            whoCanSee = filteredEmployees.map((emp) => emp._id);
        }
        const createdFile = await this.fileModel.create({
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            uploadedBy: employeeId,
            whoCanSee,
            fileId,
        });
        await this.employeeModel.findByIdAndUpdate(employeeId, {
            $push: { files: createdFile._id },
        });
        await this.companyModel.findByIdAndUpdate(company._id, {
            $push: { files: createdFile._id },
        });
        return {
            message: 'File uploaded successfully',
            file: {
                fileName: createdFile.fileName,
                url: `${process.env.CLOUD_FRONT_URL}/${fileId}`,
            },
        };
    }
    async deleteFile(fileId, employeeId) {
        if (!fileId)
            throw new common_1.BadRequestException('fileId is required');
        const file = await this.fileModel.findById(fileId);
        if (!file)
            throw new common_1.NotFoundException('File not found');
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (file.uploadedBy.toString() !== employeeId.toString()) {
            throw new common_1.BadRequestException('You are not authorized to delete this file');
        }
        const fileKey = file.fileName.includes('.') ? file.fileName : `${file._id}`;
        await this.awsService.deleteFileById(fileKey);
        await this.fileModel.findByIdAndDelete(fileId);
        await this.employeeModel.findByIdAndUpdate(file.uploadedBy, {
            $pull: { files: file._id },
        });
        await this.companyModel.findByIdAndUpdate(employee.company, {
            $pull: { files: file._id },
        });
        return {
            message: 'File deleted successfully',
            fileId,
        };
    }
    async getFilesForEmployee(employeeId) {
        if (!(0, mongoose_2.isValidObjectId)(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const files = await this.fileModel
            .find({
            $or: [
                { whoCanSee: { $size: 0 } },
                { whoCanSee: new mongoose_2.Types.ObjectId(employee._id) },
                { uploadedBy: new mongoose_2.Types.ObjectId(employee._id) },
            ],
        })
            .populate({ path: 'whoCanSee', select: 'employeeEmail' })
            .sort({ createdAt: -1 });
        return { files };
    }
    async updateFilePermissions(fileId, employeeId, visibleTo) {
        if (!(0, mongoose_2.isValidObjectId)(fileId)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const file = await this.fileModel.findById(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.uploadedBy.toString() !== employeeId.toString()) {
            throw new common_1.BadRequestException('You are not allowed to edit this file');
        }
        const uploader = await this.employeeModel
            .findById(employeeId)
            .select('company');
        if (!uploader)
            throw new common_1.BadRequestException('Uploader not found');
        if (!visibleTo || visibleTo.length === 0) {
            file.whoCanSee = [];
            await file.save();
            return { message: 'File visibility updated to everyone' };
        }
        const filteredEmployees = await this.employeeModel.find({
            employeeEmail: { $in: visibleTo },
            company: uploader.company,
        });
        if (filteredEmployees.length !== visibleTo.length) {
            const foundEmails = filteredEmployees.map((e) => e.employeeEmail);
            const invalidEmails = visibleTo.filter((email) => !foundEmails.includes(email));
            throw new common_1.BadRequestException(`Some emails are invalid or not in the company: ${invalidEmails.join(', ')}`);
        }
        const allowedIds = filteredEmployees.map((emp) => emp._id);
        file.whoCanSee = allowedIds;
        await file.save();
        return {
            message: 'File visibility updated',
            whoCanSee: visibleTo,
        };
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('file')),
    __param(2, (0, mongoose_1.InjectModel)('employee')),
    __param(3, (0, mongoose_1.InjectModel)('company')),
    __metadata("design:paramtypes", [aws_service_1.AwsService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FileService);
//# sourceMappingURL=file.service.js.map