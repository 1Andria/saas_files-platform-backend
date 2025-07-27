import { StripeService } from './stripe.service';
export declare class StripeController {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    createCheckout(companyId: string, plan: 'basic' | 'premium'): Promise<{
        url: string | null;
    }>;
    webhook(signature: string, rawBody: any): Promise<{
        received: boolean;
    }>;
}
