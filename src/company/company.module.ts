import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { companySchema } from './schema/company.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSchema } from 'src/employees/schema/employee.schema';
import { fileSchema } from 'src/file/schema/file.schema';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    AwsModule,
    MongooseModule.forFeature([{ schema: fileSchema, name: 'file' }]),
    MongooseModule.forFeature([{ schema: companySchema, name: 'company' }]),
    MongooseModule.forFeature([{ schema: EmployeeSchema, name: 'employee' }]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
