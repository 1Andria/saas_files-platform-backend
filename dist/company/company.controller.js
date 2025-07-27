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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const company_service_1 = require("./company.service");
const update_company_dto_1 = require("./dto/update-company.dto");
const company_decorator_1 = require("./decorator/company.decorator");
const change_company_password_dto_1 = require("./dto/change-company-password.dto");
const isAuth_guard_1 = require("../auth/guard/isAuth.guard");
const company_only_guard_1 = require("../auth/guard/company-only.guard");
const remove_employee_dto_1 = require("./dto/remove-employee.dto");
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    findAll() {
        return this.companyService.findAll();
    }
    findOne(id) {
        return this.companyService.findOne(id);
    }
    changeSubscription(companyId) {
        return this.companyService.subscriptionDowngrade(companyId);
    }
    changePassword(companyId, dto) {
        return this.companyService.changePassword(companyId, dto);
    }
    update(companyId, updateCompanyDto) {
        return this.companyService.update(companyId, updateCompanyDto);
    }
    async deleteFileByCompany(fileId, companyId) {
        return this.companyService.deleteFileByCompany(fileId, companyId);
    }
    removeEmployee(companyId, body) {
        return this.companyService.deleteEmployee(body.employeeId, companyId);
    }
    remove(companyId) {
        return this.companyService.remove(companyId);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('subscription-downgrade'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, company_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "changeSubscription", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, company_decorator_1.CompanyId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_company_password_dto_1.ChangeCompanyPasswordDto]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, company_decorator_1.CompanyId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('delete-file/:fileId'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, company_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "deleteFileByCompany", null);
__decorate([
    (0, common_1.Delete)('remove-employee'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, company_decorator_1.CompanyId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, remove_employee_dto_1.RemoveEmployeeDto]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "removeEmployee", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, company_only_guard_1.CompanyOnlyGuard),
    __param(0, (0, company_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "remove", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_1.Controller)('company'),
    __metadata("design:paramtypes", [company_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map