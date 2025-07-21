import { IsEnum } from 'class-validator';

export class ChangeSubscriptionDto {
  @IsEnum(['free', 'basic', 'premium'])
  plan: 'free' | 'basic' | 'premium';
}
