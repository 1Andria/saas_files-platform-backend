import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';
export declare class StripeService {
    private readonly fileModel;
    private readonly companyModel;
    private readonly employeeModel;
    private stripe;
    constructor(fileModel: Model<File>, companyModel: Model<Company>, employeeModel: Model<Employee>);
    createCheckoutSession(plan: 'basic' | 'premium', companyId: string): Promise<{
        url: string | null;
    }>;
    handleWebhook(signature: string, body: Buffer | any): Promise<{
        received: boolean;
    }>;
}
