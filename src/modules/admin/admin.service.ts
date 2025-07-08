import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { ReportStatus } from '../../../prisma/generated/prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: { approved: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        age: true,
        location: true,
        interests: true,
        profilePic: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        approved: true,
        modifiedBy: adminId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        approved: true,
      },
    });
  }

  async rejectUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          age: true,
          location: true,
          interests: true,
          profilePic: true,
          verified: true,
          approved: true,
          role: true,
          provider: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async banUser(userId: string, adminId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        approved: false,
        modifiedBy: adminId,
      },
    });
  }

  async getAllMessages(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          activity: {
            select: {
              id: true,
              title: true,
            },
          },
          groupChat: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count(),
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReportStatus(reportId: string, status: string, adminId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { 
        status: status as ReportStatus,
        modifiedBy: adminId,
      },
    });
  }

  async getActivityStats() {
    const totalActivities = await this.prisma.activity.count();
    const activeActivities = await this.prisma.activity.count({
      where: {
        dateTime: {
          gte: new Date(),
        },
        approved: true,
      },
    });

    const activitiesByCategory = await this.prisma.activity.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    return {
      totalActivities,
      activeActivities,
      activitiesByCategory,
    };
  }

  async getUserStats() {
    const totalUsers = await this.prisma.user.count();
    const approvedUsers = await this.prisma.user.count({
      where: { approved: true },
    });
    const pendingUsers = await this.prisma.user.count({
      where: { approved: false },
    });

    const usersByProvider = await this.prisma.user.groupBy({
      by: ['provider'],
      _count: {
        provider: true,
      },
    });

    return {
      totalUsers,
      approvedUsers,
      pendingUsers,
      usersByProvider,
    };
  }
}