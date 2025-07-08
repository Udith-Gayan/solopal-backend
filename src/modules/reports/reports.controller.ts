import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Report a user' })
  createReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportsService.createReport(createReportDto, req.user.userId);
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Get current user reports' })
  getUserReports(@Request() req) {
    return this.reportsService.getUserReports(req.user.userId);
  }
}