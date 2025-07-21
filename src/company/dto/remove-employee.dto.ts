import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}
