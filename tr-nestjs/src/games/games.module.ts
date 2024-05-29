import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './games.controller';
import { GameService } from './games.service';
import { Game } from './games.entity';
import { GameHistoryService } from './../games-history/games-history.service';
import { GameHistory } from '../games-history/games-history.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Game,
    GameHistory,
    User,
  ])],
  controllers: [GameController],
  providers: [ GameService,], 
})
export class GamesModule {}
