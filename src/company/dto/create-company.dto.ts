import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  country: string;

  @IsString()
  industry: string;
}
