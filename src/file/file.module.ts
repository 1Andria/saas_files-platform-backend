import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { AwsModule } from 'src/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { fileSchema } from './schema/file.schema';
import { EmployeeSchema } from 'src/employees/schema/employee.schema';
import { companySchema } from 'src/company/schema/company.schema';

@Module({
  imports: [
    AwsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ schema: fileSchema, name: 'file' }]),
    MongooseModule.forFeature([{ schema: EmployeeSchema, name: 'employee' }]),
    MongooseModule.forFeature([{ schema: companySchema, name: 'company' }]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
