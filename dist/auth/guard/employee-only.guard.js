"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeOnlyGuard = void 0;
const common_1 = require("@nestjs/common");
let EmployeeOnlyGuard = class EmployeeOnlyGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (req.user?.role !== 'employee') {
            throw new common_1.ForbiddenException('Access denied: Only employee allowed');
        }
        return true;
    }
};
exports.EmployeeOnlyGuard = EmployeeOnlyGuard;
exports.EmployeeOnlyGuard = EmployeeOnlyGuard = __decorate([
    (0, common_1.Injectable)()
], EmployeeOnlyGuard);
//# sourceMappingURL=employee-only.guard.js.map