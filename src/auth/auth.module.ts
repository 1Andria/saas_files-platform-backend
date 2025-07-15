import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from 'src/company/schema/company.schema';
import { EmailSenderModule } from 'src/email-sender/email-sender.module';

@Module({
  imports: [
    EmailSenderModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([{ schema: companySchema, name: 'company' }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
