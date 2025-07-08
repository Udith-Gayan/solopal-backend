import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '../../../prisma/generated/prisma';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(createReportDto: CreateReportDto, reporterId: string) {
    if (reporterId === createReportDto.reportedId) {
      throw new BadRequestException('Cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: createReportDto.reportedId },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    // Check if user already reported this person
    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporterId,
        reportedId: createReportDto.reportedId,
        status: 'PENDING',
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this user');
    }

    return this.prisma.report.create({
      data: {
        ...createReportDto,
        reporterId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getUserReports(userId: string) {
    return this.prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReportStatus(reportId: string, status: ReportStatus, modifiedBy: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: { 
        status,
        modifiedBy,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}