import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiverId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  activityId?: string;
}