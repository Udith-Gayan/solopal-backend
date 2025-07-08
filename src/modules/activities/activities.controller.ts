import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityCategory, ActivityVisibility } from '../../../prisma/generated/prisma';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new activity' })
  create(@Body() createActivityDto: CreateActivityDto, @Request() req) {
    return this.activitiesService.create(createActivityDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiQuery({ name: 'category', required: false, enum: ActivityCategory })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'visibility', required: false, enum: ActivityVisibility })
  findAll(
    @Query('category') category?: ActivityCategory,
    @Query('location') location?: string,
    @Query('visibility') visibility?: ActivityVisibility,
  ) {
    return this.activitiesService.findAll(category, location, visibility);
  }

  @Get('my-activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user activities' })
  getUserActivities(@Request() req) {
    return this.activitiesService.getUserActivities(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by id' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto, @Request() req) {
    return this.activitiesService.update(id, updateActivityDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Param('id') id: string, @Request() req) {
    return this.activitiesService.remove(id, req.user.userId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join an activity' })
  joinActivity(@Param('id') id: string, @Request() req) {
    return this.activitiesService.joinActivity(id, req.user.userId);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave an activity' })
  leaveActivity(@Param('id') id: string, @Request() req) {
    return this.activitiesService.leaveActivity(id, req.user.userId);
  }
}