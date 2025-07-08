import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
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
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByProviderId(providerId: string, provider: string) {
    return this.prisma.user.findFirst({
      where: { 
        providerId,
        provider: provider as any,
      },
    });
  }

  async createSocialUser(socialUser: any) {
    return this.prisma.user.create({
      data: {
        email: socialUser.email,
        firstName: socialUser.firstName,
        lastName: socialUser.lastName,
        profilePic: socialUser.profilePic,
        provider: socialUser.provider,
        providerId: socialUser.providerId,
        approved: false, // Requires admin approval
        verified: true, // Social accounts are considered verified
      },
    });
  }

  async linkSocialAccount(userId: string, socialUser: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        provider: socialUser.provider,
        providerId: socialUser.providerId,
        profilePic: socialUser.profilePic || undefined,
        modifiedBy: userId,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        modifiedBy: id,
      },
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
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserFeedback(userId: string) {
    const feedbackReceived = await this.prisma.userFeedback.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
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
      orderBy: { createdAt: 'desc' },
    });

    const feedbackGiven = await this.prisma.userFeedback.findMany({
      where: { fromUserId: userId },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });

    return {
      received: feedbackReceived,
      given: feedbackGiven,
    };
  }

  async getUserFriends(userId: string) {
    const friendships = await this.prisma.userFriendship.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'ACCEPTED' },
          { userBId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        userA: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        userB: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    return friendships.map(friendship => {
      const friend = friendship.userAId === userId ? friendship.userB : friendship.userA;
      return {
        id: friendship.id,
        friend,
        createdAt: friendship.createdAt,
      };
    });
  }
}