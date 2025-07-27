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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const sign_up_dto_1 = require("./dto/sign-up.dto");
const sign_in_dto_1 = require("./dto/sign-in.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const isAuth_guard_1 = require("./guard/isAuth.guard");
const company_decorator_1 = require("../company/decorator/company.decorator");
const invite_employee_dto_1 = require("./dto/invite-employee.dto");
const verify_employee_dto_1 = require("./dto/verify-employee.dto");
const current_user_decorator_1 = require("./decorator/current-user.decorator");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    signUp(signUpDto) {
        return this.authService.signUp(signUpDto);
    }
    signIn(signInDto) {
        return this.authService.signIn(signInDto);
    }
    verifyEmail({ email, otpCode }) {
        return this.authService.verifyEmail({ email, otpCode });
    }
    resendVerification(email) {
        return this.authService.resendOTPCode(email);
    }
    inviteEmployee({ employeeEmail }, companyId) {
        return this.authService.inviteEmployee(companyId, employeeEmail);
    }
    verifyEmployee(dto) {
        return this.authService.verifyEmployee(dto.token, dto.password);
    }
    signInEmployee({ email, password }) {
        return this.authService.signInEmployee(email, password);
    }
    getCurrentUser(user) {
        return this.authService.getCurrentUser(user.id, user.role);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sign-up'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_up_dto_1.signUpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('sign-in'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_in_dto_1.SignInDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification-code'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('invite-employee'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, company_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_employee_dto_1.InviteEmployeeDto, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "inviteEmployee", null);
__decorate([
    (0, common_1.Post)('verify-employee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_employee_dto_1.VerifyEmployeeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmployee", null);
__decorate([
    (0, common_1.Post)('sign-in-employee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_in_dto_1.SignInDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signInEmployee", null);
__decorate([
    (0, common_1.Get)('current-user'),
    (0, common_1.UseGuards)(isAuth_guard_1.IsAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map