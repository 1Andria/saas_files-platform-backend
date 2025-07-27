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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const aws_service_1 = require("../aws/aws.service");
let CompanyService = class CompanyService {
    awsService;
    fileModel;
    companyModel;
    employeeModel;
    constructor(awsService, fileModel, companyModel, employeeModel) {
        this.awsService = awsService;
        this.fileModel = fileModel;
        this.companyModel = companyModel;
        this.employeeModel = employeeModel;
    }
    findAll() {
        return this.companyModel.find();
    }
    async findOne(id) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.BadRequestException('Invalid ID provided');
        const company = await this.companyModel.findById(id);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return company;
    }
    async changePassword(companyId, dto) {
        const company = await this.companyModel
            .findById(companyId)
            .select('+companyPassword');
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const isMatch = await bcrypt.compare(dto.currentPassword, company.companyPassword);
        if (!isMatch)
            throw new common_1.BadRequestException('Incorrect current password');
        if (dto.newPassword !== dto.repeatNewPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const newHashed = await bcrypt.hash(dto.newPassword, 10);
        company.companyPassword = newHashed;
        await company.save();
        return { message: 'Password changed successfully' };
    }
    async update(companyId, { country, industry, name }) {
        if (!(0, mongoose_2.isValidObjectId)(companyId)) {
            throw new common_1.BadRequestException('Invalid ID provided');
        }
        const updatedCompany = await this.companyModel.findByIdAndUpdate(companyId, {
            companyCountry: country,
            companyIndustry: industry,
            companyName: name,
        }, { new: true });
        if (!updatedCompany) {
            throw new common_1.NotFoundException('Company not found');
        }
        return {
            message: 'Company updated successfully',
            updatedCompany,
        };
    }
    async remove(companyId) {
        if (!(0, mongoose_2.isValidObjectId)(companyId)) {
            throw new common_1.BadRequestException('Invalid ID provided');
        }
        const company = await this.companyModel
            .findById(companyId)
            .populate('employees files');
        if (!company) {
            throw new common_1.NotFoundException('Requesting company not found');
        }
        const employeeIds = company.employees.map((emp) => emp._id);
        await this.employeeModel.deleteMany({ _id: { $in: employeeIds } });
        const files = company.files;
        if (files.length > 0) {
            await Promise.all(files.map(async (file) => {
                await this.awsService.deleteFileById(file.fileName);
            }));
            await this.fileModel.deleteMany({
                _id: { $in: files.map((f) => f._id) },
            });
        }
        const deletedCompany = await this.companyModel.findByIdAndDelete(companyId);
        return {
            message: 'Company account, employees and uploaded files deleted successfully',
            deletedCompany,
        };
    }
    async deleteFileByCompany(fileId, companyId) {
        if (!fileId || !(0, mongoose_2.isValidObjectId)(fileId))
            throw new common_1.BadRequestException('Invalid file ID');
        const company = await this.companyModel.findById(companyId);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const file = await this.fileModel.findById(fileId);
        if (!file)
            throw new common_1.NotFoundException('File not found');
        if (!company.files.includes(file._id)) {
            throw new common_1.BadRequestException('This file does not belong to your company');
        }
        const fileKey = file.fileName.includes('.') ? file.fileName : `${file._id}`;
        await this.awsService.deleteFileById(fileKey);
        await this.fileModel.findByIdAndDelete(fileId);
        await this.companyModel.findByIdAndUpdate(companyId, {
            $pull: { files: file._id },
        });
        await this.employeeModel.findByIdAndUpdate(file.uploadedBy, {
            $pull: { files: file._id },
        });
        return {
            message: 'File deleted successfully by company',
            fileId,
        };
    }
    async deleteEmployee(employeeId, companyId) {
        if (!(0, mongoose_2.isValidObjectId)(employeeId) || !(0, mongoose_2.isValidObjectId)(companyId))
            throw new common_1.BadRequestException('Invalid ID provided');
        const company = await this.companyModel.findById(companyId);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const employeeObjectId = new mongoose_2.Types.ObjectId(employeeId);
        if (!company.employees.includes(employeeObjectId))
            throw new common_1.BadRequestException("You can only remove your own company's employee");
        const uploadedFiles = await this.fileModel.find({
            uploadedBy: employee._id,
        });
        for (const file of uploadedFiles) {
            const fileExt = file.fileName.split('.').pop();
            const fileId = `${file._id}.${fileExt}`;
            await this.awsService.deleteFileById(fileId);
        }
        const fileIds = uploadedFiles.map((file) => file._id);
        await this.fileModel.deleteMany({ _id: { $in: fileIds } });
        await this.companyModel.updateOne({ _id: companyId }, {
            $pull: {
                employees: employeeObjectId,
                files: { $in: fileIds },
            },
        });
        await this.employeeModel.findByIdAndDelete(employeeId);
        return {
            message: 'Employee deleted and unlinked from company successfully',
        };
    }
    async subscriptionDowngrade(companyId) {
        const company = await this.companyModel
            .findById(companyId)
            .populate('employees')
            .populate('files');
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (company.subscription.plan === 'free') {
            throw new common_1.BadRequestException('You already have free plan');
        }
        const maxEmployees = 1;
        const maxFiles = 10;
        const employeeIdsToKeep = company.employees
            .slice(0, maxEmployees)
            .map((e) => e._id);
        const employeeIdsToDelete = company.employees
            .slice(maxEmployees)
            .map((e) => e._id);
        const fileIdsToKeep = company.files.slice(0, maxFiles).map((f) => f._id);
        const fileIdsToDelete = company.files.slice(maxFiles).map((f) => f._id);
        await this.employeeModel.deleteMany({
            _id: { $in: employeeIdsToDelete },
        });
        await this.fileModel.deleteMany({
            _id: { $in: fileIdsToDelete },
        });
        await this.companyModel.findByIdAndUpdate(companyId, {
            employees: employeeIdsToKeep,
            files: fileIdsToKeep,
            subscription: {
                plan: 'free',
                activatedAt: null,
            },
        });
        return {
            message: 'Subscription downgraded to free plan',
            subscription: {
                plan: 'free',
                activatedAt: null,
            },
        };
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('file')),
    __param(2, (0, mongoose_1.InjectModel)('company')),
    __param(3, (0, mongoose_1.InjectModel)('employee')),
    __metadata("design:paramtypes", [aws_service_1.AwsService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CompanyService);
//# sourceMappingURL=company.service.js.map