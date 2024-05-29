import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageController } from './chat-messages.controller';
import { ChatMessageService } from './chat-messages.service';
import { ChatMessage } from './chat-messages.entity';
import { ChatChannel, ChatChannelMember, ChatChannelAdministrator } from '../chat-channels/chat-channels.entity';
import { ChatBlock } from '../chat-blocks/chat-blocks.entity';
import { User } from '../users/users.entity';
import { ChatChannelService } from '../chat-channels/chat-channels.service';
import { ChatBlockService } from '../chat-blocks/chat-blocks.service';
import { GameGateway } from 'src/web-socket/socket.gateway';
import { UserService } from 'src/users/users.service';
import { GameService } from 'src/games/games.service';
import { GameHistoryService } from 'src/games-history/games-history.service';
import { FriendService } from 'src/friends/friends.service';
import { Game } from 'src/games/games.entity';
import { GameHistory } from 'src/games-history/games-history.entity';
import { Friend } from 'src/friends/friends.entity';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ChatMessage,
      User,
      ChatChannel,
      ChatChannelAdministrator,
      ChatChannelMember,
      ChatBlock,
  ])],
  controllers: [ChatMessageController],
  providers: [
    ChatMessageService,
  ], 
})
export class ChatMessagesModule {}