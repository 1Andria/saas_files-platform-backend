import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';

@Schema({ timestamps: true })
export class Employee {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
  })
  employeeEmail: string;

  @Prop({ required: false, select: false })
  employeePassword?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    required: true,
  })
  company: Types.ObjectId | Company;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ default: false })
  isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
