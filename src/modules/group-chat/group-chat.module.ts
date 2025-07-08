import { Module } from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { GroupChatController } from './group-chat.controller';

@Module({
  controllers: [GroupChatController],
  providers: [GroupChatService],
})
export class GroupChatModule {}