import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './games.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async createGameIfNotExists(createGameDto: CreateGameDto): Promise<Game> {
    // Vérifier si le jeu existe déjà dans la base de données
    const existingGame = await this.gameRepository.findOneBy({ name: createGameDto.name });

    if (existingGame) {
      throw new ConflictException('Le jeu existe déjà dans la base de données.');
    }

    const newGame = new Game();
    newGame.name = createGameDto.name;
    newGame.description = createGameDto.description;

    try {
      return await this.gameRepository.save(newGame);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Impossible de sauvegarder le jeu.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Game[]> {
    return await this.gameRepository.find(); 
  }

  async findById(id: number): Promise<Game> {
  const user = await this.gameRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Channel non trouvé');
    }
    return user;
  }

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const { name, description, } = createGameDto;

    try {
      const gameToCreate = { ...createGameDto, };
      const game = this.gameRepository.create(gameToCreate);
      return await this.gameRepository.save(game);
    } catch (error) {
        throw error;
    }
  }

  async update(gameId: number, name: string, description: string): Promise<Game> {

    const game = await this.gameRepository.findOneBy({
      id: gameId,
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    game.name = name;
    game.description = description;

    return await this.gameRepository.save(game);
  }

  async delete(id: number): Promise<any> {
    const result = await this.gameRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return result;
  }
}
