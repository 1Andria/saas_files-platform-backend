import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectModel('file') private readonly fileModel: Model<File>,
    @InjectModel('company') private readonly companyModel: Model<Company>,
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY!);
  }
  async createCheckoutSession(plan: 'basic' | 'premium', companyId: string) {
    const company = await this.companyModel
      .findById(companyId)
      .populate('employees')
      .populate('files');

    if (!company) throw new NotFoundException('Company not found');

    const currentPlan = company.subscription?.plan;
    const isDowngradeFromPremium =
      currentPlan === 'premium' && plan === 'basic';

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

    const priceId =
      plan === 'basic'
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

  async handleWebhook(signature: string, body: Buffer | any) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.WEBHOOK_API_SECRET as string,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const customer = await this.stripe.customers.retrieve(
        session.customer as string,
      );
      const companyId = (customer as Stripe.Customer).metadata?.companyId;
      const subscriptionId = session.subscription;

      if (!companyId || !subscriptionId) {
        throw new BadRequestException('Missing metadata or subscription');
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId as string,
      );
      const priceId = subscription.items.data[0].price.id;

      let plan: 'basic' | 'premium';
      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
        plan = 'basic';
      } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        plan = 'premium';
      } else {
        throw new BadRequestException('Unknown price ID');
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
}
