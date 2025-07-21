import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Employee } from './schema/employee.schema';
import { ChangeCompanyPasswordDto } from 'src/company/dto/change-company-password.dto';
import * as bcrypt from 'bcrypt';
import { Company } from 'src/company/schema/company.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
    @InjectModel('company') private readonly companyModel: Model<Company>,
  ) {}

  findAll() {
    return this.employeeModel
      .find()
      .populate({ path: 'company', select: 'companyName' });
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  async remove(employeeId: string) {
    if (!isValidObjectId(employeeId)) {
      throw new BadRequestException('Invalid ID provided');
    }

    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const deletedEmployee =
      await this.employeeModel.findByIdAndDelete(employeeId);

    await this.companyModel.updateOne(
      { _id: employee.company },
      { $pull: { employees: employee._id } },
    );

    return {
      message: 'Employee deleted successfully',
      deletedEmployee,
    };
  }

  async changePassword(employeeId: string, dto: ChangeCompanyPasswordDto) {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('+employeePassword');

    if (!employee) throw new NotFoundException('Employee not found');
    if (!employee.isActive || !employee.employeePassword)
      throw new BadRequestException('Employee should verify yet');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      employee.employeePassword,
    );
    if (!isMatch) throw new BadRequestException('Incorrect current password');

    if (dto.newPassword !== dto.repeatNewPassword)
      throw new BadRequestException('Passwords do not match');

    const newHashed = await bcrypt.hash(dto.newPassword, 10);
    employee.employeePassword = newHashed;

    await employee.save();

    return { message: 'Password changed successfully' };
  }
}
