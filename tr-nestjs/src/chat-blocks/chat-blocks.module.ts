import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBlockController } from './chat-blocks.controller';
import { ChatBlockService } from './chat-blocks.service';
import { ChatBlock } from './chat-blocks.entity';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember } from 'src/chat-channels/chat-channels.entity';
import { ChatMessage } from 'src/chat-messages/chat-messages.entity';
import { User } from 'src/users/users.entity';
import { GameGateway } from 'src/web-socket/socket.gateway';
import { ChatChannelService } from 'src/chat-channels/chat-channels.service';
import { ChatMessageService } from 'src/chat-messages/chat-messages.service';
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

    ChatChannel, 
    ChatChannelAdministrator, 
    ChatChannelMember, 
    ChatMessage,
    ChatBlock,
    User, 
    Game,
    GameHistory,
    Friend,

  ])],
  controllers: [ChatBlockController],
  providers: [
    ChatBlockService,], 
})
export class ChatBlocksModule {}
