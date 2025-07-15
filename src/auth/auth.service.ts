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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('company') private readonly companyModel: Model<Company>,
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
}
