import { MailerService } from '@nestjs-modules/mailer';
export declare class EmailSenderService {
    private mailerService;
    constructor(mailerService: MailerService);
    sendOTPCode(to: string, otpCode: number): Promise<void>;
    sendInviteLink(email: string, link: string): Promise<void>;
}
