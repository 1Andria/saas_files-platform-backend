import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AwsService } from 'src/aws/aws.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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

    const uploader = await this.employeeModel.findById(employeeId).populate({
      path: 'company',
      select: 'subscription.plan',
    });

    if (!uploader) throw new NotFoundException('Employee not found');

    console.log(uploader.company);

    //     {
    //   _id: new ObjectId('68762f5de18d99c083a0c520'),
    //   subscription: { plan: 'basic' }
    // }

    let whoCanSee: mongoose.Types.ObjectId[] | 'everyone' = 'everyone';

    if (visibleTo && visibleTo.length > 0) {
      const filteredEmployees = await this.employeeModel.find({
        employeeEmail: { $in: visibleTo },
        company: uploader.company,
      });

      if (filteredEmployees.length !== visibleTo.length) {
        throw new BadRequestException('Some emails are invalid');
      }

      whoCanSee = filteredEmployees.map((emp) => emp._id);
    }

    const createdFile = await this.fileModel.create({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: employeeId,
      whoCanSee,
    });

    await this.employeeModel.findByIdAndUpdate(employeeId, {
      $push: { files: createdFile._id },
    });

    await this.companyModel.findByIdAndUpdate(uploader.company, {
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
}
