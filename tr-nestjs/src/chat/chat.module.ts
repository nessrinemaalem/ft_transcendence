import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
// import { ChatGateway } from './chat.gateway';
import { ChatChannelService } from './../chat-channels/chat-channels.service';
import { ChatMessageService } from './../chat-messages/chat-messages.service';
import { ChatBlockService } from './../chat-blocks/chat-blocks.service';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember } from './../chat-channels/chat-channels.entity';
import { ChatMessage } from './../chat-messages/chat-messages.entity';
import { ChatBlock } from '../chat-blocks/chat-blocks.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    ChatChannel, 
    ChatChannelAdministrator, 
    ChatChannelMember, 
    ChatMessage,
    ChatBlock,
    User, 
  ])],
  controllers: [ChatController, ],
  providers: [
    // ChatGateway,
    ChatChannelService, 
    ChatMessageService, 
    ChatBlockService, 
  ],
})
export class ChatModule {}
