import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AwsService } from 'src/aws/aws.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model, Types } from 'mongoose';
import { File } from './schema/file.schema';
import { Employee } from 'src/employees/schema/employee.schema';
import { Company } from 'src/company/schema/company.schema';

@Injectable()
export class FileService {
  constructor(
    private awsService: AwsService,
    @InjectModel('file') private readonly fileModel: Model<File>,
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
    @InjectModel('company') private readonly companyModel: Model<Company>,
  ) {}

  async uploadFileByEmployee(
    file: Express.Multer.File,
    employeeId: string,
    visibleTo?: string[],
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only CSV, XLS, and XLSX files allowed');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileId = `${uuidv4()}.${fileExt}`;

    await this.awsService.uploadFile(fileId, file);

    const uploader = await this.employeeModel.findById(employeeId);
    if (!uploader) throw new NotFoundException('Employee not found');

    const company = await this.companyModel
      .findById(uploader.company)
      .select('subscription.plan files');

    if (!company) throw new NotFoundException('Company not found');

    const plan = company.subscription.plan;
    const currentFilesCount = company.files.length;

    if (plan === 'free' && currentFilesCount >= 10) {
      throw new BadRequestException('Free plan allows only 10 files');
    }

    if (plan === 'basic' && currentFilesCount >= 100) {
      throw new BadRequestException('Basic plan allows only 100 files');
    }

    let whoCanSee: mongoose.Types.ObjectId[] = [];

    if (visibleTo && visibleTo.length > 0) {
      const filteredEmployees = await this.employeeModel.find({
        employeeEmail: { $in: visibleTo },
        company: company._id,
      });

      if (filteredEmployees.length !== visibleTo.length) {
        throw new BadRequestException(
          'Some emails are invalid or not in the company',
        );
      }

      whoCanSee = filteredEmployees.map((emp) => emp._id);
    }

    const createdFile = await this.fileModel.create({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: employeeId,
      whoCanSee,
      fileId,
    });

    await this.employeeModel.findByIdAndUpdate(employeeId, {
      $push: { files: createdFile._id },
    });

    await this.companyModel.findByIdAndUpdate(company._id, {
      $push: { files: createdFile._id },
    });

    return {
      message: 'File uploaded successfully',
      file: {
        fileName: createdFile.fileName,
        url: `${process.env.CLOUD_FRONT_URL}/${fileId}`,
      },
    };
  }

  async deleteFile(fileId: string, employeeId: string) {
    if (!fileId) throw new BadRequestException('fileId is required');

    const file = await this.fileModel.findById(fileId);
    if (!file) throw new NotFoundException('File not found');

    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    if (file.uploadedBy.toString() !== employeeId.toString()) {
      throw new BadRequestException(
        'You are not authorized to delete this file',
      );
    }

    const fileKey = file.fileName.includes('.') ? file.fileName : `${file._id}`;
    await this.awsService.deleteFileById(fileKey);

    await this.fileModel.findByIdAndDelete(fileId);

    await this.employeeModel.findByIdAndUpdate(file.uploadedBy, {
      $pull: { files: file._id },
    });

    await this.companyModel.findByIdAndUpdate(employee.company, {
      $pull: { files: file._id },
    });

    return {
      message: 'File deleted successfully',
      fileId,
    };
  }

  

  async getFilesForEmployee(employeeId: string) {
    if (!isValidObjectId(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const files = await this.fileModel
      .find({
        $or: [
          { whoCanSee: { $size: 0 } },
          { whoCanSee: new Types.ObjectId(employee._id) },
          { uploadedBy: new Types.ObjectId(employee._id) },
        ],
      })
      .populate({ path: 'whoCanSee', select: 'employeeEmail' })
      .sort({ createdAt: -1 });

    return { files };
  }

  async updateFilePermissions(
    fileId: string,
    employeeId: string,
    visibleTo?: string[],
  ) {
    if (!isValidObjectId(fileId)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileModel.findById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.uploadedBy.toString() !== employeeId.toString()) {
      throw new BadRequestException('You are not allowed to edit this file');
    }

    const uploader = await this.employeeModel
      .findById(employeeId)
      .select('company');

    if (!uploader) throw new BadRequestException('Uploader not found');

    if (!visibleTo || visibleTo.length === 0) {
      file.whoCanSee = [];
      await file.save();
      return { message: 'File visibility updated to everyone' };
    }

    const filteredEmployees = await this.employeeModel.find({
      employeeEmail: { $in: visibleTo },
      company: uploader.company,
    });

    if (filteredEmployees.length !== visibleTo.length) {
      const foundEmails = filteredEmployees.map((e) => e.employeeEmail);
      const invalidEmails = visibleTo.filter(
        (email) => !foundEmails.includes(email),
      );
      throw new BadRequestException(
        `Some emails are invalid or not in the company: ${invalidEmails.join(', ')}`,
      );
    }

    const allowedIds = filteredEmployees.map((emp) => emp._id);
    file.whoCanSee = allowedIds;
    await file.save();

    return {
      message: 'File visibility updated',
      whoCanSee: visibleTo,
    };
  }
}
