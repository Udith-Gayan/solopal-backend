import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prismaa/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, senderId: string) {
    return this.prisma.message.create({
      data: {
        ...createMessageDto,
        senderId,
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
        receiver: {
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

  async findConversation(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
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
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findActivityMessages(activityId: string) {
    return this.prisma.message.findMany({
      where: { activityId },
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findUserConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
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
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by conversation partner
    const conversations = new Map();
    
    messages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner,
          lastMessage: message,
          messages: [],
        });
      }
    });

    return Array.from(conversations.values());
  }
}