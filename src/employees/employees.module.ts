import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSchema } from './schema/employee.schema';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  imports: [
    MongooseModule.forFeature([{ schema: EmployeeSchema, name: 'employee' }]),
  ],
})
export class EmployeesModule {}
