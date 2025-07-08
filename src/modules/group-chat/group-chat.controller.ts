import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupChatService } from './group-chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('group-chat')
@Controller('group-chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create group chat for activity' })
  createGroupChat(@Body() createGroupChatDto: CreateGroupChatDto, @Request() req) {
    return this.groupChatService.createGroupChat(createGroupChatDto, req.user.userId);
  }

  @Get('activity/:activityId')
  @ApiOperation({ summary: 'Get group chat for activity' })
  getActivityGroupChat(@Param('activityId') activityId: string, @Request() req) {
    return this.groupChatService.getActivityGroupChat(activityId, req.user.userId);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send message to group chat' })
  sendGroupMessage(@Body() sendGroupMessageDto: SendGroupMessageDto, @Request() req) {
    return this.groupChatService.sendGroupMessage(sendGroupMessageDto, req.user.userId);
  }

  @Post(':groupChatId/members/:userId')
  @ApiOperation({ summary: 'Add member to group chat' })
  addMember(
    @Param('groupChatId') groupChatId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.groupChatService.addMemberToGroupChat(groupChatId, userId, req.user.userId);
  }

  @Delete(':groupChatId/members/:userId')
  @ApiOperation({ summary: 'Remove member from group chat' })
  removeMember(
    @Param('groupChatId') groupChatId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.groupChatService.removeMemberFromGroupChat(groupChatId, userId, req.user.userId);
  }
}