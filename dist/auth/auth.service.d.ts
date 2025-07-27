import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { signUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { Employee } from 'src/employees/schema/employee.schema';
export declare class AuthService {
    private readonly companyModel;
    private readonly employeeModel;
    private jwtService;
    private emailSenderService;
    constructor(companyModel: Model<Company>, employeeModel: Model<Employee>, jwtService: JwtService, emailSenderService: EmailSenderService);
    signUp({ country, email, industry, name, password }: signUpDto): Promise<{
        message: string;
        newCompany: import("mongoose").Document<unknown, {}, Company, {}> & Company & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    signIn({ email, password }: SignInDto): Promise<{
        token: string;
    }>;
    resendOTPCode(email: string): Promise<string>;
    verifyEmail({ email, otpCode }: VerifyEmailDto): Promise<{
        token: string;
        verify: string;
    }>;
    inviteEmployee(companyId: string, employeeEmail: string): Promise<{
        message: string;
    }>;
    verifyEmployee(token: string, password: string): Promise<{
        token: string;
        message: string;
    }>;
    signInEmployee(email: string, password: string): Promise<{
        token: string;
    }>;
    getCurrentUser(userId: string, role: 'employee' | 'company'): Promise<(import("mongoose").Document<unknown, {}, Company, {}> & Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, Employee, {}> & Employee & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })>;
}
