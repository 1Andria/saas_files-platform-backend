"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeId = void 0;
const common_1 = require("@nestjs/common");
exports.EmployeeId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.role !== 'employee') {
        throw new common_1.ForbiddenException('Access denied: Only employees allowed');
    }
    return request.user.id;
});
//# sourceMappingURL=company.decorator.js.map