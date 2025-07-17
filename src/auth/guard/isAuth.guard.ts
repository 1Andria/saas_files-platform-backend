import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';

@Injectable()
export class IsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('company') private readonly companyModel: Model<Company>,
    @InjectModel('employee') private readonly employeeModel: Model<Employee>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeaders(req.headers);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const { id, role } = payload;

      if (role === 'company') {
        const company = await this.companyModel.findById(id);
        if (!company || !company.isActive) {
          throw new NotFoundException('Company not found or not verified');
        }
        req.user = { id: company._id, role: 'company' };
      } else if (role === 'employee') {
        const employee = await this.employeeModel.findById(id);
        if (!employee || !employee.isActive) {
          throw new NotFoundException('Employee not found or not verified');
        }
        req.user = { id: employee._id, role: 'employee' };
      } else {
        throw new UnauthorizedException('Invalid role in token');
      }
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }

    return true;
  }

  private getTokenFromHeaders(headers: any): string | null {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
