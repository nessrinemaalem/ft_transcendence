import { 
  Body, Controller, Delete, Get, 
  HttpException, HttpStatus, BadRequestException,
  Param, Patch, Post, Put,
  Req, Res, UseGuards,
} from '@nestjs/common';
import { GameHistoryService } from './games-history.service';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';
import { GameHistory } from './games-history.entity';
import { validate } from 'class-validator';
import { Request, Response } from 'express'; 
import { GameGateway } from 'src/web-socket/socket.gateway';
// remplacer juste par un 

@Controller('games-his')
export class GameHistoryController {
  constructor(
    private readonly gameHistoryService: GameHistoryService,
    private readonly gameGateway: GameGateway,  
  ) {}

  @Get()
  async index(): Promise<GameHistory[]> {
    return await this.gameHistoryService.findAll();
  }

  @Get(':id')
  async show(@Param('id') chatChannelId: number): Promise<GameHistory> {
    try {
      return await this.gameHistoryService.findById(chatChannelId);
    } catch (error) {
      throw new HttpException('Game History non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('/store')
  async store(
    @Req() request: Request,
    @Res() res: Response, 
    @Body() data: { 
      game_id: number, 
      player_1_id: number,
      player_2_id: number,
      is_mode_spectator: number,
      max_scores: number,
      is_ai: number,
      mode: number
    }
  ): Promise<void> 
  {
    console.log('data', data)
    
    try {

      const gameHistory = await this.gameHistoryService.matchmaking(
        data.game_id,
        data.player_1_id,
        data.player_2_id,
        data.is_mode_spectator,
        data.max_scores,
        data.is_ai,
        data.mode
      );

      res.status(200).json({ game_history: gameHistory });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Delete(':id/destroy')
  async destroy(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') chatChannelId: number
  ): Promise<void> {    
    try {

      const gameHistory = await this.gameHistoryService.delete(chatChannelId);

      const data = {
        message: 'Utilisateur supprimé avec succès', 
        game_history: gameHistory, 
      };

      res.status(200).json(data);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Patch(':id/accept')
  async acceptInvitation(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') gameHistoryId: number,
    @Body() data: { player_2_id: number },
  ): Promise<void> {

    const { player_2_id } = data;
 
    try {

      const gameHistory = await this.gameHistoryService.acceptInvitation(gameHistoryId, player_2_id);

      const data = {
        message: 'Utilisateur a accpete avec succès', 
        game_history: gameHistory, 
      };

      res.status(200).json(data);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Post('/search')
  async searchByStatus(@Body() data: { status: number }): Promise<GameHistory[]> {
    const { status } = data;
    return this.gameHistoryService.searchByStatus(status);
  }

  @Patch(':id/update-mode-spectator')
  async updateModeSpectator(
    @Param('id') gameHistoryId: number,
    @Body() data: { is_mode_spectator: number },
  ): Promise<GameHistory> {
    return this.gameHistoryService.updateModeSpectator(gameHistoryId, data.is_mode_spectator);
  }

  @Patch(':id/update-status')
  async updateStatus(
    @Param('id') gameHistoryId: number,
    @Body() data: { status: number },
  ): Promise<GameHistory> {
    return this.gameHistoryService.updateStatus(gameHistoryId, data.status);
  }

  @Patch('join')
  async join(
    @Body() data: { 
      game_id: number,
      player_id: number 
    },
  ): Promise<GameHistory> {
    const { player_id } = data;
    try {
      return await this.gameHistoryService.joinGame(
        data.game_id,
        data.player_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  
  @Get('user-history/:id')
  async userHistory(
    @Param('id') player_id: number
  ): Promise<GameHistory[]> {
    return await this.gameHistoryService.userHistory(player_id);
  }

  @Get('user-info-total/:id')
  async userInfoTotal(@Param('id') player_id: number): 
    Promise<{ totalWin: number, totalLose: number, totalGames: number }> 
  {
    try {
      return await this.gameHistoryService.userInfoTotal(player_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('user-info-week/:id')
  async userInfoWeek(
    @Param('id') player_id: number
  ): Promise<{ day: string, total: number, total_win: number }[]> {
    return await this.gameHistoryService.getWeeklyPlayerStats(player_id);
  }

}
