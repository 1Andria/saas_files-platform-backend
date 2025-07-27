"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModule = void 0;
const common_1 = require("@nestjs/common");
const company_service_1 = require("./company.service");
const company_controller_1 = require("./company.controller");
const company_schema_1 = require("./schema/company.schema");
const mongoose_1 = require("@nestjs/mongoose");
const employee_schema_1 = require("../employees/schema/employee.schema");
const file_schema_1 = require("../file/schema/file.schema");
const aws_module_1 = require("../aws/aws.module");
let CompanyModule = class CompanyModule {
};
exports.CompanyModule = CompanyModule;
exports.CompanyModule = CompanyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            aws_module_1.AwsModule,
            mongoose_1.MongooseModule.forFeature([{ schema: file_schema_1.fileSchema, name: 'file' }]),
            mongoose_1.MongooseModule.forFeature([{ schema: company_schema_1.companySchema, name: 'company' }]),
            mongoose_1.MongooseModule.forFeature([{ schema: employee_schema_1.EmployeeSchema, name: 'employee' }]),
        ],
        controllers: [company_controller_1.CompanyController],
        providers: [company_service_1.CompanyService],
    })
], CompanyModule);
//# sourceMappingURL=company.module.js.map