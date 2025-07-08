import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';

@Injectable()
export class GroupChatService {
  constructor(private prisma: PrismaService) {}

  async createGroupChat(createGroupChatDto: CreateGroupChatDto, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: createGroupChatDto.activityId },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.hostId !== userId) {
      throw new ForbiddenException('Only activity host can create group chat');
    }

    // Check if group chat already exists
    const existingChat = await this.prisma.groupChat.findUnique({
      where: { activityId: createGroupChatDto.activityId },
    });

    if (existingChat) {
      throw new ForbiddenException('Group chat already exists for this activity');
    }

    const groupChat = await this.prisma.groupChat.create({
      data: {
        name: createGroupChatDto.name || `${activity.title} Chat`,
        activityId: createGroupChatDto.activityId,
      },
    });

    // Add host as admin member
    await this.prisma.groupChatMember.create({
      data: {
        userId,
        groupChatId: groupChat.id,
        isAdmin: true,
      },
    });

    // Add all approved participants
    const approvedParticipants = activity.participants.filter(p => p.status === 'APPROVED');
    
    for (const participant of approvedParticipants) {
      await this.prisma.groupChatMember.create({
        data: {
          userId: participant.userId,
          groupChatId: groupChat.id,
          isAdmin: false,
        },
      });
    }

    return this.getGroupChatDetails(groupChat.id);
  }

  async getActivityGroupChat(activityId: string, userId: string) {
    const groupChat = await this.prisma.groupChat.findUnique({
      where: { activityId },
      include: {
        members: {
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
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!groupChat) {
      throw new NotFoundException('Group chat not found');
    }

    // Check if user is a member
    const isMember = groupChat.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group chat');
    }

    return groupChat;
  }

  async sendGroupMessage(sendGroupMessageDto: SendGroupMessageDto, userId: string) {
    const groupChat = await this.prisma.groupChat.findUnique({
      where: { id: sendGroupMessageDto.groupChatId },
      include: { members: true },
    });

    if (!groupChat) {
      throw new NotFoundException('Group chat not found');
    }

    // Check if user is a member
    const isMember = groupChat.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group chat');
    }

    return this.prisma.message.create({
      data: {
        content: sendGroupMessageDto.content,
        senderId: userId,
        groupChatId: sendGroupMessageDto.groupChatId,
        messageType: 'GROUP',
      },
      include: {
        sender: {
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

  async addMemberToGroupChat(groupChatId: string, userId: string, adminUserId: string) {
    const groupChat = await this.prisma.groupChat.findUnique({
      where: { id: groupChatId },
      include: { members: true },
    });

    if (!groupChat) {
      throw new NotFoundException('Group chat not found');
    }

    // Check if admin user is actually an admin
    const adminMember = groupChat.members.find(member => member.userId === adminUserId && member.isAdmin);
    if (!adminMember) {
      throw new ForbiddenException('Only group admins can add members');
    }

    // Check if user is already a member
    const existingMember = groupChat.members.find(member => member.userId === userId);
    if (existingMember) {
      throw new ForbiddenException('User is already a member');
    }

    return this.prisma.groupChatMember.create({
      data: {
        userId,
        groupChatId,
        isAdmin: false,
      },
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
    });
  }

  async removeMemberFromGroupChat(groupChatId: string, userId: string, adminUserId: string) {
    const groupChat = await this.prisma.groupChat.findUnique({
      where: { id: groupChatId },
      include: { members: true },
    });

    if (!groupChat) {
      throw new NotFoundException('Group chat not found');
    }

    // Check if admin user is actually an admin
    const adminMember = groupChat.members.find(member => member.userId === adminUserId && member.isAdmin);
    if (!adminMember) {
      throw new ForbiddenException('Only group admins can remove members');
    }

    const memberToRemove = groupChat.members.find(member => member.userId === userId);
    if (!memberToRemove) {
      throw new NotFoundException('User is not a member of this group');
    }

    return this.prisma.groupChatMember.delete({
      where: {
        userId_groupChatId: {
          userId,
          groupChatId,
        },
      },
    });
  }

  private async getGroupChatDetails(groupChatId: string) {
    return this.prisma.groupChat.findUnique({
      where: { id: groupChatId },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        members: {
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
}