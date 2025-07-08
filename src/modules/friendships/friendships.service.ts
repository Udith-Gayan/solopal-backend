import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { FriendshipStatus } from '../../../prisma/generated/prisma';

@Injectable()
export class FriendshipsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(userAId: string, userBId: string) {
    if (userAId === userBId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if users exist
    const [userA, userB] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userAId } }),
      this.prisma.user.findUnique({ where: { id: userBId } }),
    ]);

    if (!userA || !userB) {
      throw new NotFoundException('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await this.prisma.userFriendship.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });

    if (existingFriendship) {
      throw new BadRequestException('Friendship request already exists');
    }

    return this.prisma.userFriendship.create({
      data: {
        userAId,
        userBId,
        status: 'PENDING',
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
  }

  async respondToFriendRequest(friendshipId: string, userId: string, status: FriendshipStatus) {
    const friendship = await this.prisma.userFriendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request not found');
    }

    if (friendship.userBId !== userId) {
      throw new BadRequestException('You can only respond to friend requests sent to you');
    }

    if (friendship.status !== 'PENDING') {
      throw new BadRequestException('This friend request has already been responded to');
    }

    return this.prisma.userFriendship.update({
      where: { id: friendshipId },
      data: { status },
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
  }

  async getFriendRequests(userId: string) {
    const sentRequests = await this.prisma.userFriendship.findMany({
      where: {
        userAId: userId,
        status: 'PENDING',
      },
      include: {
        userB: {
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

    const receivedRequests = await this.prisma.userFriendship.findMany({
      where: {
        userBId: userId,
        status: 'PENDING',
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sent: sentRequests,
      received: receivedRequests,
    };
  }

  async getFriends(userId: string) {
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
      orderBy: { createdAt: 'desc' },
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

  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await this.prisma.userFriendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship.userAId !== userId && friendship.userBId !== userId) {
      throw new BadRequestException('You can only remove your own friendships');
    }

    return this.prisma.userFriendship.delete({
      where: { id: friendshipId },
    });
  }
}