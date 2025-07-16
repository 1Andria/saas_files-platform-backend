import { IsString, Length } from 'class-validator';

export class VerifyEmployeeDto {
  @IsString()
  token: string;

  @IsString()
  @Length(6, 20)
  password: string;
}
