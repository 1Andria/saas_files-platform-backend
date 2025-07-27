import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class File {
  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ type: String, required: true })
  fileId: string;

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'employee', default: [] })
  whoCanSee: mongoose.Types.ObjectId[];

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
