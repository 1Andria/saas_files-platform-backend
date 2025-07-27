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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let StripeService = class StripeService {
    fileModel;
    companyModel;
    employeeModel;
    stripe;
    constructor(fileModel, companyModel, employeeModel) {
        this.fileModel = fileModel;
        this.companyModel = companyModel;
        this.employeeModel = employeeModel;
        this.stripe = new stripe_1.default(process.env.STRIPE_API_KEY);
    }
    async createCheckoutSession(plan, companyId) {
        const company = await this.companyModel
            .findById(companyId)
            .populate('employees')
            .populate('files');
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const currentPlan = company.subscription?.plan;
        const isDowngradeFromPremium = currentPlan === 'premium' && plan === 'basic';
        if (isDowngradeFromPremium) {
            const maxEmployees = 10;
            const maxFiles = 100;
            const employeeIdsToKeep = company.employees
                .slice(0, maxEmployees)
                .map((e) => e._id);
            const employeeIdsToDelete = company.employees
                .slice(maxEmployees)
                .map((e) => e._id);
            const fileIdsToKeep = company.files.slice(0, maxFiles).map((f) => f._id);
            const fileIdsToDelete = company.files.slice(maxFiles).map((f) => f._id);
            await this.employeeModel.deleteMany({
                _id: { $in: employeeIdsToDelete },
            });
            await this.fileModel.deleteMany({ _id: { $in: fileIdsToDelete } });
            await this.companyModel.findByIdAndUpdate(companyId, {
                employees: employeeIdsToKeep,
                files: fileIdsToKeep,
            });
        }
        const priceId = plan === 'basic'
            ? process.env.STRIPE_BASIC_PRICE_ID
            : process.env.STRIPE_PREMIUM_PRICE_ID;
        const customer = await this.stripe.customers.create({
            metadata: { companyId: company._id.toString() },
        });
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customer.id,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.FRONT_URL}/dashboard?tab=profile&success=true`,
            cancel_url: `${process.env.FRONT_URL}/dashboard?tab=profile&success=false`,
        });
        return { url: session.url };
    }
    async handleWebhook(signature, body) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, process.env.WEBHOOK_API_SECRET);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customer = await this.stripe.customers.retrieve(session.customer);
            const companyId = customer.metadata?.companyId;
            const subscriptionId = session.subscription;
            if (!companyId || !subscriptionId) {
                throw new common_1.BadRequestException('Missing metadata or subscription');
            }
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;
            let plan;
            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
                plan = 'basic';
            }
            else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
                plan = 'premium';
            }
            else {
                throw new common_1.BadRequestException('Unknown price ID');
            }
            await this.companyModel.findByIdAndUpdate(companyId, {
                $set: {
                    'subscription.plan': plan,
                    'subscription.activatedAt': new Date(),
                },
            });
            return { received: true };
        }
        return { received: false };
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('file')),
    __param(1, (0, mongoose_1.InjectModel)('company')),
    __param(2, (0, mongoose_1.InjectModel)('employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], StripeService);
//# sourceMappingURL=stripe.service.js.map