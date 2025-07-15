import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Company {
  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  companyEmail: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  companyPassword: string;

  @Prop({ type: String, required: true })
  companyCountry: string;

  @Prop({ type: String, required: true })
  companyIndustry: string;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

  @Prop({ type: String, default: '' })
  companyProfilePicture: string;

  @Prop({
    type: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free',
      },
      activatedAt: { type: Date, default: null },
    },
    default: {},
  })
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    activatedAt: Date | null;
  };

  @Prop({
    type: Number,
  })
  OTPCode: Number;

  @Prop({
    type: Date,
  })
  OTPValidationDate: Date;

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'employee', default: [] })
  employees: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'file', default: [] })
  files: mongoose.Types.ObjectId[];
}

export const companySchema = SchemaFactory.createForClass(Company);
