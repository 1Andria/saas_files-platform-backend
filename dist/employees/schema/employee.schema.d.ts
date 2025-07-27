import mongoose, { Types } from 'mongoose';
export declare class Employee {
    employeeEmail: string;
    employeePassword?: string;
    company: mongoose.Schema.Types.ObjectId;
    files: mongoose.Schema.Types.ObjectId[];
    isActive: boolean;
}
export declare const EmployeeSchema: mongoose.Schema<Employee, mongoose.Model<Employee, any, any, any, mongoose.Document<unknown, any, Employee, any> & Employee & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Employee, mongoose.Document<unknown, {}, mongoose.FlatRecord<Employee>, {}> & mongoose.FlatRecord<Employee> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
