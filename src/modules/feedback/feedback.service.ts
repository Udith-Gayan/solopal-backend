import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(createFeedbackDto: CreateFeedbackDto, fromUserId: string) {
    const { activityId, toUserId, rating, comment } = createFeedbackDto;

    // Check if activity exists
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Check if both users participated in the activity
    const fromUserParticipated = activity.participants.some(p => p.userId === fromUserId && p.status === 'APPROVED') || activity.hostId === fromUserId;
    const toUserParticipated = activity.participants.some(p => p.userId === toUserId && p.status === 'APPROVED') || activity.hostId === toUserId;

    if (!fromUserParticipated || !toUserParticipated) {
      throw new BadRequestException('Both users must have participated in the activity');
    }

    // Check if feedback already exists
    const existingFeedback = await this.prisma.userFeedback.findFirst({
      where: {
        activityId,
        fromUserId,
        toUserId,
      },
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback already provided for this user in this activity');
    }

    return this.prisma.userFeedback.create({
      data: {
        activityId,
        fromUserId,
        toUserId,
        rating,
        comment,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getActivityFeedback(activityId: string) {
    return this.prisma.userFeedback.findMany({
      where: { activityId },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserFeedbackStats(userId: string) {
    const feedbackReceived = await this.prisma.userFeedback.findMany({
      where: { toUserId: userId },
    });

    const totalRatings = feedbackReceived.length;
    const averageRating = totalRatings > 0 
      ? feedbackReceived.reduce((sum, feedback) => sum + feedback.rating, 0) / totalRatings 
      : 0;

    const ratingDistribution = {
      1: feedbackReceived.filter(f => f.rating === 1).length,
      2: feedbackReceived.filter(f => f.rating === 2).length,
      3: feedbackReceived.filter(f => f.rating === 3).length,
      4: feedbackReceived.filter(f => f.rating === 4).length,
      5: feedbackReceived.filter(f => f.rating === 5).length,
    };

    return {
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
    };
  }
}