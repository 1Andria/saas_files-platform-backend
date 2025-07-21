import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { IsAuthGuard } from 'src/auth/guard/isAuth.guard';
import { CompanyOnlyGuard } from 'src/auth/guard/company-only.guard';
import { CompanyId } from 'src/company/decorator/company.decorator';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout')
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  createCheckout(
    @CompanyId() companyId: string,
    @Body('plan') plan: 'basic' | 'premium',
  ) {
    return this.stripeService.createCheckoutSession(plan, companyId);
  }

  @Post('webhook')
  webhook(@Headers('stripe-signature') signature: string, @Body() rawBody) {
    return this.stripeService.handleWebhook(signature, rawBody);
  }
}
