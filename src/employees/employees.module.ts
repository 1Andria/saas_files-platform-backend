import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSchema } from './schema/employee.schema';
import { CompanyModule } from 'src/company/company.module';
import { companySchema } from 'src/company/schema/company.schema';
import { fileSchema } from 'src/file/schema/file.schema';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  imports: [
    AwsModule,
    MongooseModule.forFeature([{ schema: EmployeeSchema, name: 'employee' }]),
    MongooseModule.forFeature([{ schema: companySchema, name: 'company' }]),
    MongooseModule.forFeature([{ schema: fileSchema, name: 'file' }]),
  ],
})
export class EmployeesModule {}
