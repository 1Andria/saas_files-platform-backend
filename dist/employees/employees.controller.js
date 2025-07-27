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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employees_service_1 = require("./employees.service");
const isAuth_guard_1 = require("../auth/guard/isAuth.guard");
const employee_only_guard_1 = require("../auth/guard/employee-only.guard");
const company_decorator_1 = require("./decorator/company.decorator");
const change_company_password_dto_1 = require("../company/dto/change-company-password.dto");
let EmployeesController = class EmployeesController {
    employeesService;
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    changePassword(employeeId, dto) {
        return this.employeesService.changePassword(employeeId, dto);
    }
    remove(employeeId) {
        return this.employeesService.remove(employeeId);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    __param(0, (0, company_decorator_1.EmployeeId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_company_password_dto_1.ChangeCompanyPasswordDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Delete)(''),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard, employee_only_guard_1.EmployeeOnlyGuard),
    __param(0, (0, company_decorator_1.EmployeeId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "remove", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map