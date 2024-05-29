import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistoryController } from './games-history.controller';
import { GameHistoryService } from './games-history.service';
import { GameHistory } from './games-history.entity';
import { User } from '../users/users.entity';
import { Game } from './../games/games.entity';
import { GameService } from './../games/games.service';
import { GameGateway } from 'src/web-socket/socket.gateway';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      GameHistory,
      Game,
      User,
    ])
  ],
  controllers: [GameHistoryController],
  providers: [
    GameHistoryService, 
  ], 
})
export class GameHistorysModule {}
