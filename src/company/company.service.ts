import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Company } from './schema/company.schema';
import * as bcrypt from 'bcrypt';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('company') private readonly companyModel: Model<Company>,
  ) {}
  findAll() {
    return this.companyModel.find();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('Invalid ID provided');
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async changePassword(companyId: string, dto: ChangeCompanyPasswordDto) {
    const company = await this.companyModel
      .findById(companyId)
      .select('+companyPassword');

    if (!company) throw new NotFoundException('Company not found');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      company.companyPassword,
    );
    if (!isMatch) throw new BadRequestException('Incorrect current password');

    if (dto.newPassword !== dto.repeatNewPassword)
      throw new BadRequestException('Passwords do not match');

    const newHashed = await bcrypt.hash(dto.newPassword, 10);
    company.companyPassword = newHashed;

    await company.save();

    return { message: 'Password changed successfully' };
  }

  async update(companyId: string, updateCompanyDto: UpdateCompanyDto) {
    if (!isValidObjectId(companyId)) {
      throw new BadRequestException('Invalid ID provided');
    }
    if (updateCompanyDto.email) {
      const existingCompany = await this.companyModel.findOne({
        companyEmail: updateCompanyDto.email.toLowerCase(),
        _id: { $ne: companyId },
      });
      if (existingCompany) {
        throw new BadRequestException('This email is already in use');
      }
    }
    const updatedCompany = await this.companyModel.findByIdAndUpdate(
      companyId,
      updateCompanyDto,
      { new: true },
    );
    if (!updatedCompany) {
      throw new NotFoundException('Company not found');
    }

    return {
      message: 'Company updated successfully',
      updatedCompany,
    };
  }

  async remove(companyId: string) {
    if (!isValidObjectId(companyId)) {
      throw new BadRequestException('Invalid ID provided');
    }

    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Requesting company not found');
    }

    const deletedCompany = await this.companyModel.findByIdAndDelete(companyId);

    return {
      message: 'Company account deleted successfully',
      deletedCompany,
    };
  }
}
