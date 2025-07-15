import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

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
}
