import mongoose, { Types } from 'mongoose';
export declare class Company {
    companyName: string;
    companyEmail: string;
    companyPassword: string;
    companyCountry: string;
    companyIndustry: string;
    isActive: boolean;
    companyProfilePicture: string;
    subscription: {
        plan: 'free' | 'basic' | 'premium';
        activatedAt: Date | null;
    };
    OTPCode: Number;
    OTPValidationDate: Date;
    employees: mongoose.Types.ObjectId[];
    files: mongoose.Types.ObjectId[];
}
export declare const companySchema: mongoose.Schema<Company, mongoose.Model<Company, any, any, any, mongoose.Document<unknown, any, Company, any> & Company & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Company, mongoose.Document<unknown, {}, mongoose.FlatRecord<Company>, {}> & mongoose.FlatRecord<Company> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
