import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  findUserConversations(@Request() req) {
    return this.messagesService.findUserConversations(req.user.userId);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with specific user' })
  findConversation(@Param('userId') userId: string, @Request() req) {
    return this.messagesService.findConversation(req.user.userId, userId);
  }

  @Get('activity/:activityId')
  @ApiOperation({ summary: 'Get activity messages' })
  findActivityMessages(@Param('activityId') activityId: string) {
    return this.messagesService.findActivityMessages(activityId);
  }
}