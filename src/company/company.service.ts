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

  async update(
    companyId: string,
    { country, industry, name }: UpdateCompanyDto,
  ) {
    if (!isValidObjectId(companyId)) {
      throw new BadRequestException('Invalid ID provided');
    }
    const updatedCompany = await this.companyModel.findByIdAndUpdate(
      companyId,
      {
        companyCountry: country,
        companyIndustry: industry,
        companyName: name,
      },
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

    const company = await this.companyModel
      .findById(companyId)
      .populate('employees files');

    if (!company) {
      throw new NotFoundException('Requesting company not found');
    }

    const employeeIds = company.employees.map((emp: any) => emp._id);
    await this.employeeModel.deleteMany({ _id: { $in: employeeIds } });

    const files = company.files;

    if (files.length > 0) {
      await Promise.all(
        files.map(async (file: any) => {
          await this.awsService.deleteFileById(file.fileName);
        }),
      );
      await this.fileModel.deleteMany({
        _id: { $in: files.map((f: any) => f._id) },
      });
    }

    const deletedCompany = await this.companyModel.findByIdAndDelete(companyId);

    return {
      message:
        'Company account, employees and uploaded files deleted successfully',
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

  async subscriptionDowngrade(companyId: string, newPlan: 'free' | 'basic') {
    if (!['free', 'basic'].includes(newPlan)) {
      throw new BadRequestException('Invalid subscription plan');
    }

    const company = await this.companyModel
      .findById(companyId)
      .populate('employees')
      .populate('files');

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const currentPlan = company.subscription.plan;

    if (newPlan === currentPlan) {
      throw new BadRequestException(`You already have ${newPlan} plan`);
    }

    if (currentPlan === 'free') {
      throw new BadRequestException('You are already on free plan');
    }

    let maxEmployees = 10;
    let maxFiles = 100;

    if (newPlan === 'free') {
      maxEmployees = 1;
      maxFiles = 10;
    }

    const employeeIds = company.employees
      .slice(0, maxEmployees)
      .map((e) => e._id);
    await this.employeeModel.deleteMany({
      _id: { $nin: employeeIds },
      company: company._id,
    });

    const fileIds = company.files.slice(0, maxFiles).map((f) => f._id);
    await this.fileModel.deleteMany({
      _id: { $nin: fileIds },
      uploadedBy: { $in: employeeIds },
    });

    await this.companyModel.findByIdAndUpdate(companyId, {
      employees: employeeIds,
      files: fileIds,
      subscription: {
        plan: newPlan,
        activatedAt: null,
      },
    });

    return {
      message: `Subscription downgraded to ${newPlan} plan`,
      subscription: {
        plan: newPlan,
        activatedAt: null,
      },
    };
  }
}
