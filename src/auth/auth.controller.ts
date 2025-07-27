import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { IsAuthGuard } from './guard/isAuth.guard';
import { CompanyId } from 'src/company/decorator/company.decorator';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { VerifyEmployeeDto } from './dto/verify-employee.dto';
import { CurrentUser } from './decorator/current-user.decorator';

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

  @Post('sign-in-employee')
  signInEmployee(@Body() { email, password }: SignInDto) {
    return this.authService.signInEmployee(email, password);
  }

  @Get('current-user')
  @UseGuards(IsAuthGuard)
  getCurrentUser(
    @CurrentUser() user: { id: string; role: 'employee' | 'company' },
  ) {
    return this.authService.getCurrentUser(user.id, user.role);
  }
}
