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
import { IsAuthGuard } from 'src/auth/guard/isAuth.guard';
import { CompanyId } from './decorator/company.decorator';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';

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

  @Patch('change-password')
  @UseGuards(IsAuthGuard)
  changePassword(
    @CompanyId() companyId: string,
    @Body() dto: ChangeCompanyPasswordDto,
  ) {
    return this.companyService.changePassword(companyId, dto);
  }

  @Patch(':id')
  @UseGuards(IsAuthGuard)
  update(
    @CompanyId() companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(companyId, updateCompanyDto);
  }

  @Delete()
  @UseGuards(IsAuthGuard)
  remove(@CompanyId() companyId: string) {
    return this.companyService.remove(companyId);
  }
}
