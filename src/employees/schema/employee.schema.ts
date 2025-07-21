import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

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
  company: mongoose.Schema.Types.ObjectId ;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'file' })
  files: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: false })
  isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
