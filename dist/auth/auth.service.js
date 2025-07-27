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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const email_sender_service_1 = require("../email-sender/email-sender.service");
let AuthService = class AuthService {
    companyModel;
    employeeModel;
    jwtService;
    emailSenderService;
    constructor(companyModel, employeeModel, jwtService, emailSenderService) {
        this.companyModel = companyModel;
        this.employeeModel = employeeModel;
        this.jwtService = jwtService;
        this.emailSenderService = emailSenderService;
    }
    async signUp({ country, email, industry, name, password }) {
        const existCompany = await this.companyModel.findOne({
            companyEmail: email,
        });
        if (existCompany)
            throw new common_1.BadRequestException('Company already exists');
        const hashedPass = await bcrypt.hash(password, 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const validationDate = new Date();
        validationDate.setTime(validationDate.getTime() + 3 * 60 * 1000);
        const newCompany = await this.companyModel.create({
            companyCountry: country,
            companyEmail: email,
            companyName: name,
            companyIndustry: industry,
            companyPassword: hashedPass,
            OTPCode: otpCode,
            OTPValidationDate: validationDate,
        });
        await this.emailSenderService.sendOTPCode(email, otpCode);
        return {
            message: 'Company created successfully please verify your email',
            newCompany,
        };
    }
    async signIn({ email, password }) {
        const existCompany = await this.companyModel
            .findOne({ companyEmail: email })
            .select('companyPassword isActive');
        if (!existCompany) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        const isPasswordEqual = await bcrypt.compare(password, existCompany.companyPassword);
        if (!isPasswordEqual) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        if (!existCompany.isActive) {
            throw new common_1.BadRequestException('Verify email');
        }
        const payLoad = {
            id: existCompany._id,
            role: 'company',
        };
        const token = this.jwtService.sign(payLoad, { expiresIn: '1h' });
        return { token };
    }
    async resendOTPCode(email) {
        const company = await this.companyModel.findOne({ companyEmail: email });
        if (!company)
            throw new common_1.BadRequestException('Company not found');
        if (company.isActive)
            throw new common_1.BadRequestException('Email already verified');
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const validationDate = new Date();
        validationDate.setTime(validationDate.getTime() + 3 * 60 * 1000);
        await this.companyModel.updateOne({ _id: company._id }, { $set: { OTPCode: otpCode, OTPValidationDate: validationDate } });
        await this.emailSenderService.sendOTPCode(email, otpCode);
        return 'Check email to finish verification ';
    }
    async verifyEmail({ email, otpCode }) {
        const company = await this.companyModel.findOne({ companyEmail: email });
        if (!company)
            throw new common_1.NotFoundException('company not found');
        if (company.isActive)
            throw new common_1.BadRequestException('Company already verified');
        if (new Date(company.OTPValidationDate) < new Date())
            throw new common_1.BadRequestException('OTP is outDated ');
        if (company.OTPCode !== otpCode)
            throw new common_1.BadRequestException('invalid OTPCode provided');
        await this.companyModel.updateOne({ _id: company._id }, {
            $set: { OTPCode: null, OTPValidationDate: null, isActive: true },
        });
        const payload = {
            id: company._id,
            role: 'company',
        };
        const token = this.jwtService.sign(payload, { expiresIn: '1h' });
        return { token, verify: 'ok' };
    }
    async inviteEmployee(companyId, employeeEmail) {
        const company = await this.companyModel.findById(companyId);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.companyEmail === employeeEmail)
            throw new common_1.BadRequestException('You can not invite yourself');
        const existing = await this.employeeModel.findOne({ employeeEmail });
        if (existing)
            throw new common_1.BadRequestException('Employee already invited or registered');
        const employeeCount = await this.employeeModel.countDocuments({
            company: company._id,
        });
        const plan = company.subscription?.plan || 'free';
        if (plan === 'free' && employeeCount >= 1)
            throw new common_1.BadRequestException('Free plan allows only 1 employee');
        if (plan === 'basic' && employeeCount >= 10)
            throw new common_1.BadRequestException('Basic plan allows up to 10 employees');
        const employee = await this.employeeModel.create({
            employeeEmail,
            company: company._id,
            isActive: false,
        });
        company.employees.push(employee._id);
        await company.save();
        const token = this.jwtService.sign({ id: employee._id, role: 'employee' }, { expiresIn: '1h' });
        const inviteLink = `${process.env.FRONT_URL}/auth/verify-employee?token=${token}`;
        await this.emailSenderService.sendInviteLink(employeeEmail, inviteLink);
        return {
            message: 'Invitation link sent to employee email',
        };
    }
    async verifyEmployee(token, password) {
        let decoded;
        try {
            decoded = this.jwtService.verify(token);
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
        const employee = await this.employeeModel
            .findById(decoded.id)
            .select('+employeePassword');
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (employee.isActive)
            throw new common_1.BadRequestException('Already verified');
        const hashedPass = await bcrypt.hash(password, 10);
        employee.employeePassword = hashedPass;
        employee.isActive = true;
        await employee.save();
        await this.companyModel.findByIdAndUpdate(employee.company, {
            $addToSet: { employees: employee._id },
        });
        const authToken = this.jwtService.sign({ id: employee._id, role: 'employee' }, { expiresIn: '1h' });
        return { token: authToken, message: 'Employee verified successfully' };
    }
    async signInEmployee(email, password) {
        const employee = await this.employeeModel
            .findOne({ employeeEmail: email })
            .select('+employeePassword');
        if (!employee)
            throw new common_1.BadRequestException('Invalid credentials');
        if (!employee.isActive)
            throw new common_1.BadRequestException('Employee is not verified');
        const isMatch = await bcrypt.compare(password, employee.employeePassword);
        if (!isMatch)
            throw new common_1.BadRequestException('Invalid credentials');
        const token = this.jwtService.sign({ id: employee._id, role: 'employee' }, { expiresIn: '1h' });
        return { token };
    }
    async getCurrentUser(userId, role) {
        if (role === 'company') {
            const company = await this.companyModel
                .findById(userId)
                .populate({ path: 'employees' })
                .populate({
                path: 'files',
                populate: {
                    path: 'uploadedBy',
                    select: 'employeeEmail',
                },
            });
            if (!company)
                throw new common_1.NotFoundException('Company not found');
            return company;
        }
        if (role === 'employee') {
            const employee = await this.employeeModel
                .findById(userId)
                .populate({ path: 'company', select: 'companyName' });
            if (!employee)
                throw new common_1.NotFoundException('Employee not found');
            return employee;
        }
        throw new common_1.BadRequestException('Invalid role');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('company')),
    __param(1, (0, mongoose_1.InjectModel)('employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        email_sender_service_1.EmailSenderService])
], AuthService);
//# sourceMappingURL=auth.service.js.map