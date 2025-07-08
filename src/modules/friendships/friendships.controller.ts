import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FriendshipsService } from './friendships.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondToFriendRequestDto } from './dto/respond-to-friend-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('friendships')
@Controller('friendships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('send-request')
  @ApiOperation({ summary: 'Send friend request' })
  sendFriendRequest(@Body() sendFriendRequestDto: SendFriendRequestDto, @Request() req) {
    return this.friendshipsService.sendFriendRequest(req.user.userId, sendFriendRequestDto.userBId);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Respond to friend request' })
  respondToFriendRequest(
    @Param('id') id: string,
    @Body() respondToFriendRequestDto: RespondToFriendRequestDto,
    @Request() req,
  ) {
    return this.friendshipsService.respondToFriendRequest(id, req.user.userId, respondToFriendRequestDto.status);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get friend requests' })
  getFriendRequests(@Request() req) {
    return this.friendshipsService.getFriendRequests(req.user.userId);
  }

  @Get('friends')
  @ApiOperation({ summary: 'Get friends list' })
  getFriends(@Request() req) {
    return this.friendshipsService.getFriends(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove friend' })
  removeFriend(@Param('id') id: string, @Request() req) {
    return this.friendshipsService.removeFriend(id, req.user.userId);
  }
}