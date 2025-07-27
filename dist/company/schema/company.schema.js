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
exports.companySchema = exports.Company = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Company = class Company {
    companyName;
    companyEmail;
    companyPassword;
    companyCountry;
    companyIndustry;
    isActive;
    companyProfilePicture;
    subscription;
    OTPCode;
    OTPValidationDate;
    employees;
    files;
};
exports.Company = Company;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Company.prototype, "companyName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Company.prototype, "companyEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        select: false,
    }),
    __metadata("design:type", String)
], Company.prototype, "companyPassword", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Company.prototype, "companyCountry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Company.prototype, "companyIndustry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Company.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Company.prototype, "companyProfilePicture", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            plan: {
                type: String,
                enum: ['free', 'basic', 'premium'],
                default: 'free',
            },
            activatedAt: { type: Date, default: null },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Company.prototype, "subscription", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
    }),
    __metadata("design:type", Number)
], Company.prototype, "OTPCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
    }),
    __metadata("design:type", Date)
], Company.prototype, "OTPValidationDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.default.Types.ObjectId], ref: 'employee', default: [] }),
    __metadata("design:type", Array)
], Company.prototype, "employees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.default.Types.ObjectId], ref: 'file', default: [] }),
    __metadata("design:type", Array)
], Company.prototype, "files", void 0);
exports.Company = Company = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Company);
exports.companySchema = mongoose_1.SchemaFactory.createForClass(Company);
//# sourceMappingURL=company.schema.js.map