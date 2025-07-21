import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { FileService } from './file.service';
import { IsAuthGuard } from 'src/auth/guard/isAuth.guard';
import { EmployeeOnlyGuard } from 'src/auth/guard/employee-only.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeId } from 'src/employees/decorator/company.decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-file')
  @UseGuards(IsAuthGuard, EmployeeOnlyGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @EmployeeId() employeeId: string,
    @Body('visibleTo') visibleTo: string[],
  ) {
    return this.fileService.uploadFileByEmployee(file, employeeId, visibleTo);
  }

  @Delete(':fileId')
  @UseGuards(IsAuthGuard)
  deleteFile(
    @Param('fileId') fileId: string,
    @EmployeeId() employeeId: string,
  ) {
    return this.fileService.deleteFile(fileId, employeeId);
  }

  @Get('company/:companyId')
  async getCompanyFiles(@Param('companyId') companyId: string) {
    return this.fileService.getFilesByCompany(companyId);
  }

  @Get('employee/:employeeId')
  async getEmployeeFiles(@Param('employeeId') employeeId: string) {
    return this.fileService.getFilesForEmployee(employeeId);
  }

  @Patch(':fileId/permissions')
  @UseGuards(IsAuthGuard, EmployeeOnlyGuard)
  updateFilePermissions(
    @Param('fileId') fileId: string,
    @Body('visibleTo') visibleTo: string[],
    @EmployeeId() employeeId: string,
  ) {
    return this.fileService.updateFilePermissions(
      fileId,
      employeeId,
      visibleTo,
    );
  }
}
