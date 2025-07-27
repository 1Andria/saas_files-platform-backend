"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyId = void 0;
const common_1 = require("@nestjs/common");
exports.CompanyId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.role !== 'company') {
        throw new common_1.ForbiddenException('Access denied: Only companies allowed');
    }
    return request.user.id;
});
//# sourceMappingURL=company.decorator.js.map