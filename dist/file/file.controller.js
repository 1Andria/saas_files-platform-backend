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
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const file_service_1 = require("./file.service");
const isAuth_guard_1 = require("../auth/guard/isAuth.guard");
const employee_only_guard_1 = require("../auth/guard/employee-only.guard");
const platform_express_1 = require("@nestjs/platform-express");
const company_decorator_1 = require("../employees/decorator/company.decorator");
let FileController = class FileController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    uploadFile(file, employeeId, visibleTo) {
        return this.fileService.uploadFileByEmployee(file, employeeId, visibleTo);
    }
    deleteFile(fileId, employeeId) {
        return this.fileService.deleteFile(fileId, employeeId);
    }
    async getEmployeeFiles(employeeId) {
        return this.fileService.getFilesForEmployee(employeeId);
    }
    updateFilePermissions(fileId, visibleTo, employeeId) {
        return this.fileService.updateFilePermissions(fileId, employeeId, visibleTo);
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload-file'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, company_decorator_1.EmployeeId)()),
    __param(2, (0, common_1.Body)('visibleTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, company_decorator_1.EmployeeId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    __param(0, (0, company_decorator_1.EmployeeId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getEmployeeFiles", null);
__decorate([
    (0, common_1.Patch)(':fileId/permissions'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Body)('visibleTo')),
    __param(2, (0, company_decorator_1.EmployeeId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "updateFilePermissions", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)('file'),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map