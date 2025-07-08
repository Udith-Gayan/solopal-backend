import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FriendshipStatus } from '../../../../prisma/generated/prisma';

export class RespondToFriendRequestDto {
  @ApiProperty({ enum: FriendshipStatus })
  @IsEnum(FriendshipStatus)
  status: FriendshipStatus;
}