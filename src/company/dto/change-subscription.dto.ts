import { IsEnum } from 'class-validator';

export class ChangeSubscriptionDto {
  @IsEnum(['free', 'basic'])
  plan: 'free' | 'basic';
}
