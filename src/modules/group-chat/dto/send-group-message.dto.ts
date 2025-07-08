import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendGroupMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  groupChatId: string;
}