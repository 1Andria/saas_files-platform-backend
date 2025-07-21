import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Company } from './schema/company.schema';
import * as bcrypt from 'bcrypt';
import { ChangeCompanyPasswordDto } from './dto/change-company-password.dto';
import { Employee } from 'src/employees/schema/employee.schema';
import { File } from 'src/file/schema/file.schema';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class CompanyService {
  constructor(
    private awsService: AwsService,
    @InjectModel('file') private readonly fileModel: Model<File>,
    @InjectModel('company') private readonly companyModel: Model<Company>,
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
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

  async deleteEmployee(employeeId: string, companyId: string) {
    if (!isValidObjectId(employeeId) || !isValidObjectId(companyId))
      throw new BadRequestException('Invalid ID provided');

    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    const employeeObjectId = new Types.ObjectId(employeeId);

    if (!company.employees.includes(employeeObjectId))
      throw new BadRequestException(
        "You can only remove your own company's employee",
      );

    const uploadedFiles = await this.fileModel.find({
      uploadedBy: employee._id,
    });

    for (const file of uploadedFiles) {
      const fileExt = file.fileName.split('.').pop();
      const fileId = `${file._id}.${fileExt}`;
      await this.awsService.deleteFileById(fileId);
    }

    const fileIds = uploadedFiles.map((file) => file._id);
    await this.fileModel.deleteMany({ _id: { $in: fileIds } });

    await this.companyModel.updateOne(
      { _id: companyId },
      {
        $pull: {
          employees: employeeObjectId,
          files: { $in: fileIds },
        },
      },
    );

    await this.employeeModel.findByIdAndDelete(employeeId);

    return {
      message: 'Employee deleted and unlinked from company successfully',
    };
  }

  async changeSubscription(
    companyId: string,
    newPlan: 'free' | 'basic' | 'premium',
  ) {
    if (!['free', 'basic', 'premium'].includes(newPlan)) {
      throw new BadRequestException('Invalid subscription plan');
    }

    if (newPlan === 'basic' || newPlan === 'premium') {
      throw new BadRequestException(
        `Use Stripe Checkout to upgrade to ${newPlan} plan`,
      );
    }

    const company = await this.companyModel.findById(companyId);
    if (company?.subscription.plan === 'free')
      throw new BadRequestException('You already have free plan');

    const updatedCompanyPlan = await this.companyModel.findByIdAndUpdate(
      companyId,
      {
        $set: {
          'subscription.plan': newPlan,
          'subscription.activatedAt': null,
        },
      },
      { new: true },
    );

    if (!updatedCompanyPlan) {
      throw new BadRequestException('Something went wrong, try again');
    }

    return {
      message: `Subscription downgraded to free plan`,
      subscription: updatedCompanyPlan.subscription,
    };
  }
}
