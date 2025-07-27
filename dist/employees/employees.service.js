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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const aws_service_1 = require("../aws/aws.service");
let EmployeesService = class EmployeesService {
    awsService;
    employeeModel;
    companyModel;
    fileModel;
    constructor(awsService, employeeModel, companyModel, fileModel) {
        this.awsService = awsService;
        this.employeeModel = employeeModel;
        this.companyModel = companyModel;
        this.fileModel = fileModel;
    }
    async remove(employeeId) {
        if (!(0, mongoose_2.isValidObjectId)(employeeId)) {
            throw new common_1.BadRequestException('Invalid ID provided');
        }
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
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
        const deletedEmployee = await this.employeeModel.findByIdAndDelete(employeeId);
        await this.companyModel.updateOne({ _id: employee.company }, { $pull: { employees: employee._id } });
        return {
            message: 'Employee deleted successfully',
            deletedEmployee,
        };
    }
    async changePassword(employeeId, dto) {
        const employee = await this.employeeModel
            .findById(employeeId)
            .select('+employeePassword');
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (!employee.isActive || !employee.employeePassword)
            throw new common_1.BadRequestException('Employee should verify yet');
        const isMatch = await bcrypt.compare(dto.currentPassword, employee.employeePassword);
        if (!isMatch)
            throw new common_1.BadRequestException('Incorrect current password');
        if (dto.newPassword !== dto.repeatNewPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const newHashed = await bcrypt.hash(dto.newPassword, 10);
        employee.employeePassword = newHashed;
        await employee.save();
        return { message: 'Password changed successfully' };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('employee')),
    __param(2, (0, mongoose_1.InjectModel)('company')),
    __param(3, (0, mongoose_1.InjectModel)('file')),
    __metadata("design:paramtypes", [aws_service_1.AwsService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map