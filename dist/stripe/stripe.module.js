"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeModule = void 0;
const common_1 = require("@nestjs/common");
const stripe_controller_1 = require("./stripe.controller");
const stripe_service_1 = require("./stripe.service");
const mongoose_1 = require("@nestjs/mongoose");
const company_schema_1 = require("../company/schema/company.schema");
const employee_schema_1 = require("../employees/schema/employee.schema");
const file_schema_1 = require("../file/schema/file.schema");
let StripeModule = class StripeModule {
};
exports.StripeModule = StripeModule;
exports.StripeModule = StripeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ schema: employee_schema_1.EmployeeSchema, name: 'employee' }]),
            mongoose_1.MongooseModule.forFeature([{ schema: company_schema_1.companySchema, name: 'company' }]),
            mongoose_1.MongooseModule.forFeature([{ schema: file_schema_1.fileSchema, name: 'file' }]),
        ],
        controllers: [stripe_controller_1.StripeController],
        providers: [stripe_service_1.StripeService],
    })
], StripeModule);
//# sourceMappingURL=stripe.module.js.map