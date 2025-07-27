import mongoose from 'mongoose';
export declare class File {
    fileName: string;
    fileId: string;
    whoCanSee: mongoose.Types.ObjectId[];
    mimeType: string;
    size: number;
    uploadedBy: mongoose.Schema.Types.ObjectId;
}
export declare const fileSchema: mongoose.Schema<File, mongoose.Model<File, any, any, any, mongoose.Document<unknown, any, File, any> & File & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, File, mongoose.Document<unknown, {}, mongoose.FlatRecord<File>, {}> & mongoose.FlatRecord<File> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
