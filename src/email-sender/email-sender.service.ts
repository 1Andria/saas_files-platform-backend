import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class EmailSenderService {
  constructor(private mailerService: MailerService) {}

  async sendOTPCode(to: string, otpCode: number) {
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="background-color: #2d89ef; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Email Verification Code</h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 24px;">
              Use the following One-Time Password (OTP) to verify your account. This code is valid for the next <strong>3 minutes</strong>:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; font-size: 30px; font-weight: bold; letter-spacing: 6px; background-color: #f0f0f0; padding: 15px 30px; border-radius: 8px; color: #2d89ef;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #666;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            &copy; 2025 Your Company. All rights reserved.
          </td>
        </tr>
      </table>
    </div>`;

    try {
      await this.mailerService.sendMail({
        to,
        from: 'SWIPT_FILE <andriamelua22@gmail.com>',
        subject: 'Your OTP Code',
        html: htmlTemplate,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }
  }
}
