import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { signUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { Employee } from 'src/employees/schema/employee.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('company') private readonly companyModel: Model<Company>,
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
    private jwtService: JwtService,
    private emailSenderService: EmailSenderService,
  ) {}

  async signUp({ country, email, industry, name, password }: signUpDto) {
    const existCompany = await this.companyModel.findOne({
      companyEmail: email,
    });
    if (existCompany) throw new BadRequestException('Company already exists');

    const hashedPass = await bcrypt.hash(password, 10);

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const validationDate = new Date();
    validationDate.setTime(validationDate.getTime() + 3 * 60 * 1000);

    const newCompany = await this.companyModel.create({
      companyCountry: country,
      companyEmail: email,
      companyName: name,
      companyIndustry: industry,
      companyPassword: hashedPass,
      OTPCode: otpCode,
      OTPValidationDate: validationDate,
    });

    await this.emailSenderService.sendOTPCode(email, otpCode);

    return {
      message: 'Company created successfully please verify your email',
      newCompany,
    };
  }

  async signIn({ email, password }: SignInDto) {
    const existCompany = await this.companyModel
      .findOne({ companyEmail: email })
      .select('companyPassword isActive');
    if (!existCompany) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      existCompany.companyPassword,
    );
    if (!isPasswordEqual) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!existCompany.isActive) throw new BadRequestException('Verify email');

    const payLoad = {
      id: existCompany._id,
    };
    const token = this.jwtService.sign(payLoad, { expiresIn: '1h' });

    return { token };
  }

  async resendOTPCode(email: string) {
    const company = await this.companyModel.findOne({ companyEmail: email });
    if (!company) throw new BadRequestException('Company not found');
    if (company.isActive)
      throw new BadRequestException('Email already verified');

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const validationDate = new Date();
    validationDate.setTime(validationDate.getTime() + 3 * 60 * 1000);

    await this.companyModel.updateOne(
      { _id: company._id },
      { $set: { OTPCode: otpCode, OTPValidationDate: validationDate } },
    );

    await this.emailSenderService.sendOTPCode(email, otpCode);

    return 'Check email to finish verification ';
  }

  async verifyEmail({ email, otpCode }: VerifyEmailDto) {
    const company = await this.companyModel.findOne({ companyEmail: email });

    if (!company) throw new NotFoundException('company not found');

    if (company.isActive)
      throw new BadRequestException('Company already verified');

    if (new Date(company.OTPValidationDate) < new Date())
      throw new BadRequestException('OTP is outDated ');

    if (company.OTPCode !== otpCode)
      throw new BadRequestException('invalid OTPCode provided');

    // fronturl/verifyuser?token=backendToken-ამ ლინკს დააწვება გადაიყვანს verifyuser შიგნით  იქნება ინფუთი urlდან ამოვიღებ ტოკენ backendToken

    await this.companyModel.updateOne(
      { _id: company._id },
      {
        $set: { OTPCode: null, OTPValidationDate: null, isActive: true },
      },
    );

    const payload = {
      id: company._id,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { token, verify: 'ok' };
  }

  async inviteEmployee(companyId: string, employeeEmail: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    if (company.companyEmail === employeeEmail)
      throw new BadRequestException('You can not invite yourself');

    const existing = await this.employeeModel.findOne({ employeeEmail });
    if (existing)
      throw new BadRequestException('Employee already invited or registered');

    const employee = await this.employeeModel.create({
      employeeEmail,
      company: company._id,
      isActive: false,
    });

    const token = this.jwtService.sign(
      { id: employee._id },
      { expiresIn: '1h' },
    );

    const inviteLink = `${process.env.FRONT_URL}/verify-employee?token=${token}`;

    await this.emailSenderService.sendInviteLink(employeeEmail, inviteLink);

    return {
      message: 'Invitation link sent to employee email',
    };
  }

  async verifyEmployee(token: string, password: string) {
    let decoded: { id: string };
    try {
      decoded = this.jwtService.verify(token);
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }

    const employee = await this.employeeModel
      .findById(decoded.id)
      .select('+employeePassword');
    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.isActive) throw new BadRequestException('Already verified');

    const hashedPass = await bcrypt.hash(password, 10);
    employee.employeePassword = hashedPass;
    employee.isActive = true;

    await employee.save();

    const authToken = this.jwtService.sign(
      { id: employee._id },
      { expiresIn: '1h' },
    );

    return { token: authToken, message: 'Employee verified successfully' };
  }

  async resendInviteToEmployee(companyId: string, employeeEmail: string) {
    const employee = await this.employeeModel.findOne({ employeeEmail });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.isActive) {
      throw new BadRequestException('Employee is already verified');
    }

    if (employee.company.toString() !== companyId) {
      throw new BadRequestException(
        'You can only resend invite to your own employee',
      );
    }

    const token = this.jwtService.sign(
      { id: employee._id },
      { expiresIn: '1h' },
    );

    const inviteLink = `${process.env.FRONT_URL}/verify-employee?token=${token}`;

    await this.emailSenderService.sendInviteLink(employeeEmail, inviteLink);

    return {
      message: 'New invitation link sent to employee email',
    };
  }
}
