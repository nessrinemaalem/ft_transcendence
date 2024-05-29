import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatChannelController } from './chat-channels.controller';
import { ChatChannelService } from './chat-channels.service';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember } from './chat-channels.entity';
import { User } from '../users/users.entity';
import { ChatMessage } from '../chat-messages/chat-messages.entity';
import { ChatBlock } from '../chat-blocks/chat-blocks.entity';
import { ChatMessageService } from '../chat-messages/chat-messages.service'; // Import ChatMessageService
import { ChatBlockService } from '../chat-blocks/chat-blocks.service';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ChatChannel, 
      ChatChannelAdministrator, 
      ChatChannelMember, 
      ChatMessage,
      ChatBlock,
      User, 
  ])],
  controllers: [ChatChannelController],
  providers: [
    ChatChannelService, 
    ChatMessageService, 
    ChatBlockService
  ], 
})
export class ChatChannelsModule {}
