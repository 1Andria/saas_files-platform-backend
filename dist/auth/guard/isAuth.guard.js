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
exports.IsAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let IsAuthGuard = class IsAuthGuard {
    jwtService;
    companyModel;
    employeeModel;
    constructor(jwtService, companyModel, employeeModel) {
        this.jwtService = jwtService;
        this.companyModel = companyModel;
        this.employeeModel = employeeModel;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = this.getTokenFromHeaders(req.headers);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            const { id, role } = payload;
            if (role === 'company') {
                const company = await this.companyModel.findById(id);
                if (!company || !company.isActive) {
                    throw new common_1.NotFoundException('Company not found or not verified');
                }
                req.user = { id: company._id, role: 'company' };
            }
            else if (role === 'employee') {
                const employee = await this.employeeModel.findById(id);
                if (!employee || !employee.isActive) {
                    throw new common_1.NotFoundException('Employee not found or not verified');
                }
                req.user = { id: employee._id, role: 'employee' };
            }
            else {
                throw new common_1.UnauthorizedException('Invalid role in token');
            }
        }
        catch {
            throw new common_1.UnauthorizedException('Token expired or invalid');
        }
        return true;
    }
    getTokenFromHeaders(headers) {
        const authorization = headers['authorization'];
        if (!authorization)
            return null;
        const [type, token] = authorization.split(' ');
        return type === 'Bearer' ? token : null;
    }
};
exports.IsAuthGuard = IsAuthGuard;
exports.IsAuthGuard = IsAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('company')),
    __param(2, (0, mongoose_1.InjectModel)('employee')),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mongoose_2.Model,
        mongoose_2.Model])
], IsAuthGuard);
//# sourceMappingURL=isAuth.guard.js.map