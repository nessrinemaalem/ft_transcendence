import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { GameService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './games.entity';
import { validate } from 'class-validator';

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService
  ) {}

  @Get()
  async index(): Promise<Game[]> {
    return await this.gameService.findAll();
  }

  @Get(':id')
  async show(@Param('id') gameId: number): Promise<Game> {
    try {
      return await this.gameService.findById(gameId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('/store')
  async store(@Body() createGameDto: CreateGameDto): Promise<Game> {
    const errors = await validate(createGameDto);
    if (errors.length > 0) {
      const errorMessage = Object.values(errors[0].constraints)[0];
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    return this.gameService.create(createGameDto);
  }

  @Put(':id/update')
  async update(
    @Param('id') gameId: number,
    @Body() data: { name: string, description: string },
  ) {
    return await this.gameService.update(gameId, data.name, data.description);
  }

  @Delete(':id/destroy')
  async destroy(@Param('id') gameId: number): Promise<{ message: string }> {
    try {
      await this.gameService.delete(gameId);
      return { message: 'Game supprimé avec succès' };
    } catch (error) {
      throw new HttpException('Game non trouvé', HttpStatus.NOT_FOUND);
    }
  }
}
