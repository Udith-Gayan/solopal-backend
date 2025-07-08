import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityCategory, ActivityVisibility } from '../../../prisma/generated/prisma';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto, hostId: string) {
    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        hostId,
        currentParticipants: 0,
        visibility: createActivityDto.visibility || 'PUBLIC',
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(category?: ActivityCategory, location?: string, visibility?: ActivityVisibility) {
    const where: any = {
      approved: true,
      visibility: visibility || 'PUBLIC',
    };
    
    if (category) {
      where.category = category;
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    return this.prisma.activity.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            bio: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
        feedback: {
          include: {
            fromUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.hostId !== userId) {
      throw new BadRequestException('Only the host can update this activity');
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        ...updateActivityDto,
        modifiedBy: userId,
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.hostId !== userId) {
      throw new BadRequestException('Only the host can delete this activity');
    }

    return this.prisma.activity.delete({
      where: { id },
    });
  }

  async joinActivity(activityId: string, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.hostId === userId) {
      throw new BadRequestException('host cannot join their own activity');
    }

    if (activity.maxParticipants && activity.currentParticipants >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    const existingParticipant = activity.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      throw new BadRequestException('Already joined this activity');
    }

    await this.prisma.$transaction([
      this.prisma.activityParticipant.create({
        data: {
          userId,
          activityId,
          status: 'APPROVED',
        },
      }),
      this.prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Successfully joined activity' };
  }

  async leaveActivity(activityId: string, userId: string) {
    const participant = await this.prisma.activityParticipant.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Not a participant of this activity');
    }

    await this.prisma.$transaction([
      this.prisma.activityParticipant.delete({
        where: {
          userId_activityId: {
            userId,
            activityId,
          },
        },
      }),
      this.prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Successfully left activity' };
  }

  async getUserActivities(userId: string) {
    const createdActivities = await this.prisma.activity.findMany({
      where: { hostId: userId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    const joinedActivities = await this.prisma.activity.findMany({
      where: {
        participants: {
          some: {
            userId,
            status: 'APPROVED',
          },
        },
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return {
      created: createdActivities,
      joined: joinedActivities,
    };
  }
}