import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangeCompanyPasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  repeatNewPassword: string;
}
