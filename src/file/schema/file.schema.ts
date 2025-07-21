import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Employee } from 'src/employees/schema/employee.schema';

@Schema({ timestamps: true })
export class File {
  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
    required: true,
  })
  whoCanSee: mongoose.Schema.Types.ObjectId[] | 'everyone';

  @Prop({ type: String, required: true })
  mimeType: string;

  @Prop({ type: Number, required: true })
  size: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true,
  })
  uploadedBy: mongoose.Schema.Types.ObjectId;
}

export const fileSchema = SchemaFactory.createForClass(File);
