import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { IsAuthGuard } from './guard/isAuth.guard';
import { CompanyId } from 'src/company/decorator/company.decorator';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { VerifyEmployeeDto } from './dto/verify-employee.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: signUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify-email')
  verifyEmail(@Body() { email, otpCode }: VerifyEmailDto) {
    return this.authService.verifyEmail({ email, otpCode });
  }

  @Post('resend-verification-code')
  resendVerification(@Body('email') email: string) {
    return this.authService.resendOTPCode(email);
  }

  @Post('invite-employee')
  @UseGuards(IsAuthGuard)
  inviteEmployee(
    @Body() { employeeEmail }: InviteEmployeeDto,
    @CompanyId() companyId: string,
  ) {
    return this.authService.inviteEmployee(companyId, employeeEmail);
  }

  @Post('verify-employee')
  verifyEmployee(@Body() dto: VerifyEmployeeDto) {
    return this.authService.verifyEmployee(dto.token, dto.password);
  }

  @Post('resend-invite')
  @UseGuards(IsAuthGuard)
  resendInviteToEmployee(
    @Body('email') employeeEmail: string,
    @CompanyId() companyId: string,
  ) {
    return this.authService.resendInviteToEmployee(companyId, employeeEmail);
  }
}
