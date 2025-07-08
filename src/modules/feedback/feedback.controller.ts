import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create feedback for a user' })
  createFeedback(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.createFeedback(createFeedbackDto, req.user.userId);
  }

  @Get('activity/:activityId')
  @ApiOperation({ summary: 'Get feedback for an activity' })
  getActivityFeedback(@Param('activityId') activityId: string) {
    return this.feedbackService.getActivityFeedback(activityId);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get user feedback statistics' })
  getUserFeedbackStats(@Param('userId') userId: string) {
    return this.feedbackService.getUserFeedbackStats(userId);
  }
}