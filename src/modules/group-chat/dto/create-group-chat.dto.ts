import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupChatDto {
  @ApiProperty()
  @IsString()
  activityId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}