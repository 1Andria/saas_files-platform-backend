"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const { id, role } = request.user;
    if (!id || !role) {
        throw new Error('Invalid token: missing id or role');
    }
    return { id, role };
});
//# sourceMappingURL=current-user.decorator.js.map