import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, companySchema } from 'src/company/schema/company.schema';
import { EmployeeSchema } from 'src/employees/schema/employee.schema';
import { fileSchema } from 'src/file/schema/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: EmployeeSchema, name: 'employee' }]),
    MongooseModule.forFeature([{ schema: companySchema, name: 'company' }]),
    MongooseModule.forFeature([{ schema: fileSchema, name: 'file' }]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
