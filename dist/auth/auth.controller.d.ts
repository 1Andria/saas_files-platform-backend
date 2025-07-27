import { AuthService } from './auth.service';
import { signUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { VerifyEmployeeDto } from './dto/verify-employee.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signUpDto: signUpDto): Promise<{
        message: string;
        newCompany: import("mongoose").Document<unknown, {}, import("../company/schema/company.schema").Company, {}> & import("../company/schema/company.schema").Company & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    signIn(signInDto: SignInDto): Promise<{
        token: string;
    }>;
    verifyEmail({ email, otpCode }: VerifyEmailDto): Promise<{
        token: string;
        verify: string;
    }>;
    resendVerification(email: string): Promise<string>;
    inviteEmployee({ employeeEmail }: InviteEmployeeDto, companyId: string): Promise<{
        message: string;
    }>;
    verifyEmployee(dto: VerifyEmployeeDto): Promise<{
        token: string;
        message: string;
    }>;
    signInEmployee({ email, password }: SignInDto): Promise<{
        token: string;
    }>;
    getCurrentUser(user: {
        id: string;
        role: 'employee' | 'company';
    }): Promise<(import("mongoose").Document<unknown, {}, import("../company/schema/company.schema").Company, {}> & import("../company/schema/company.schema").Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, import("../employees/schema/employee.schema").Employee, {}> & import("../employees/schema/employee.schema").Employee & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })>;
}
