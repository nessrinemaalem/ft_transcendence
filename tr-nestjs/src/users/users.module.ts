import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User } from './users.entity';
import { SharedModule } from 'src/shared.module';
import { GameHistoryService } from 'src/games-history/games-history.service';
import { Game } from 'src/games/games.entity';
import { GameHistory } from 'src/games-history/games-history.entity';


@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([User, Game, GameHistory])
  ],
  controllers: [UserController],
  providers: [UserService, GameHistoryService],
  
})
export class UsersModule {}
