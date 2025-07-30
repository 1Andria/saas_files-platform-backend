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
        from: 'File_Controller <andriamelua22@gmail.com>',
        subject: 'Your OTP Code',
        html: htmlTemplate,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }
  }

  async sendInviteLink(email: string, link: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'You are Invited to Join a Company',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">You've Been Invited!</h2>
          <p style="font-size: 16px; color: #555;">
            A company has invited you to join their team as an employee.
          </p>
          <p style="font-size: 16px; color: #555;">
            To accept the invitation and set your password, please click the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            This link will expire in 1 hour. If you did not expect this email, you can ignore it.
          </p>
        </div>
      </div>
    `,
    });
  }
}
