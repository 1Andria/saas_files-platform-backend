import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendInviteDto {
  @IsEmail()
  @IsNotEmpty()
  employeeEmail: string;
}
