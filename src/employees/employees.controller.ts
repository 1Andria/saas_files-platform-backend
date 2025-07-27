import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { IsAuthGuard } from 'src/auth/guard/isAuth.guard';
import { EmployeeOnlyGuard } from 'src/auth/guard/employee-only.guard';
import { EmployeeId } from './decorator/company.decorator';
import { ChangeCompanyPasswordDto } from 'src/company/dto/change-company-password.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Patch('change-password')
  @UseGuards(IsAuthGuard, EmployeeOnlyGuard)
  changePassword(
    @EmployeeId() employeeId: string,
    @Body() dto: ChangeCompanyPasswordDto,
  ) {
    return this.employeesService.changePassword(employeeId, dto);
  }

  @Delete('')
  @UseGuards(IsAuthGuard, EmployeeOnlyGuard)
  remove(@EmployeeId() employeeId: string) {
    return this.employeesService.remove(employeeId);
  }
}
