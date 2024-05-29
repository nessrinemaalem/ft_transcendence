import { Module } from '@nestjs/common';
import { GameGateway } from './web-socket/socket.gateway';
import { GameService } from './games/games.service';
import { GameHistoryService } from './games-history/games-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistory } from './games-history/games-history.entity';
import { Game } from './games/games.entity';
import { User } from './users/users.entity';
import { UserService } from './users/users.service';
import { Friend } from './friends/friends.entity';
import { FriendService } from './friends/friends.service';
import { ChatChannelService } from './chat-channels/chat-channels.service';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember } from './chat-channels/chat-channels.entity';
import { ChatMessage } from './chat-messages/chat-messages.entity';
import { ChatBlock } from './chat-blocks/chat-blocks.entity';
import { ChatMessageService } from './chat-messages/chat-messages.service';
import { ChatBlockService } from './chat-blocks/chat-blocks.service';
 
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Game,
      GameHistory,
      Friend,
      ChatChannel, 
      ChatChannelAdministrator, 
      ChatChannelMember, 
      ChatMessage,
      ChatBlock,
    ]),
  ],
  providers: [
    GameGateway, 
    UserService,
    GameService, GameHistoryService,
    FriendService,
    ChatChannelService,
    ChatMessageService,
    ChatBlockService,
  ],
  exports: [GameGateway],
})
export class SharedModule {}
