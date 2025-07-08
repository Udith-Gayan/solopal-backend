import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending-users')
  @ApiOperation({ summary: 'Get pending user registrations' })
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Post('approve-user/:id')
  @ApiOperation({ summary: 'Approve user registration' })
  approveUser(@Param('id') id: string, @Request() req) {
    return this.adminService.approveUser(id, req.user.userId);
  }

  @Post('reject-user/:id')
  @ApiOperation({ summary: 'Reject user registration' })
  rejectUser(@Param('id') id: string) {
    return this.adminService.rejectUser(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getAllUsers(parseInt(page), parseInt(limit));
  }

  @Post('ban-user/:id')
  @ApiOperation({ summary: 'Ban user' })
  banUser(@Param('id') id: string, @Request() req) {
    return this.adminService.banUser(id, req.user.userId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get all messages for moderation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllMessages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.adminService.getAllMessages(parseInt(page), parseInt(limit));
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all user reports' })
  getReports() {
    return this.adminService.getReports();
  }

  @Patch('reports/:id/status')
  @ApiOperation({ summary: 'Update report status' })
  updateReportStatus(@Param('id') id: string, @Query('status') status: string, @Request() req) {
    return this.adminService.updateReportStatus(id, status, req.user.userId);
  }

  @Get('stats/activities')
  @ApiOperation({ summary: 'Get activity statistics' })
  getActivityStats() {
    return this.adminService.getActivityStats();
  }

  @Get('stats/users')
  @ApiOperation({ summary: 'Get user statistics' })
  getUserStats() {
    return this.adminService.getUserStats();
  }
}