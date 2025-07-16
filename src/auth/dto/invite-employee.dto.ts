import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteEmployeeDto {
  @IsNotEmpty()
  @IsEmail()
  employeeEmail: string;
}
