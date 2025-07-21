import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyId } from './decorator/company.decorator';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';
import { IsAuthGuard } from '../auth/guard/isAuth.guard';
import { CompanyOnlyGuard } from 'src/auth/guard/company-only.guard';
import { RemoveEmployeeDto } from './dto/remove-employee.dto';
import { ChangeSubscriptionDto } from './dto/change-subscription.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch('subscription')
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  changeSubscription(
    @CompanyId() companyId: string,
    @Body() dto: ChangeSubscriptionDto,
  ) {
    return this.companyService.subscriptionDowngrade(companyId, dto.plan);
  }

  @Patch('change-password')
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  changePassword(
    @CompanyId() companyId: string,
    @Body() dto: ChangeCompanyPasswordDto,
  ) {
    return this.companyService.changePassword(companyId, dto);
  }

  @Patch(':id')
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  update(
    @CompanyId() companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(companyId, updateCompanyDto);
  }

  @Delete('remove-employee')
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  removeEmployee(
    @CompanyId() companyId: string,
    @Body() body: RemoveEmployeeDto,
  ) {
    return this.companyService.deleteEmployee(body.employeeId, companyId);
  }

  @Delete()
  @UseGuards(IsAuthGuard, CompanyOnlyGuard)
  remove(@CompanyId() companyId: string) {
    return this.companyService.remove(companyId);
  }
}
