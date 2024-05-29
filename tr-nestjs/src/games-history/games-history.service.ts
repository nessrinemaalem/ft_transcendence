import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, 
  LessThanOrEqual, QueryFailedError, DeepPartial,
  Between,
} from 'typeorm';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';
import { GameHistory } from './games-history.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(GameHistory)
    private readonly gameHistoryRepository: Repository<GameHistory>,
  ) {}

  async findAll(): Promise<GameHistory[]> {
    return await this.gameHistoryRepository.find({
        order: {
            updated_at: 'DESC'
        } 
    });
  }

  async findAllViewable(): Promise<GameHistory[]> {
    return await this.gameHistoryRepository.find({
        where: {
            status: 1,
            is_mode_spectator: 1
        }
    });
  }

  async findPlayerGameCurrent(player_id: number): Promise<GameHistory> {
    return await this.gameHistoryRepository.findOne({
      where: [
        { player_1_id: player_id, status: 0 },
        { player_2_id: player_id, status: 0 },
        { player_1_id: player_id, status: 1 },
        { player_2_id: player_id, status: 1 },
      ],
    });
  }

  async findById(id: number): Promise<GameHistory> {
    const gameHistory = await this.gameHistoryRepository.findOneBy({ id }); 
    if (!gameHistory) {
      throw new NotFoundException('Historique de jeu non trouvé');
    }
    return gameHistory;
  }

  async create(
    game_id: number,
    player_1_id: number,
    player_2_id: number,
  ): Promise<any> 
  {

    //invite
    if (player_1_id && player_2_id)
    {
      const existingGame = await this.gameHistoryRepository.findOne({
        where: [
          { player_1_id, player_2_id, status: 0 },
          { player_1_id, status: 1 },
          { player_2_id, status: 1 },
        ],
      });

      if (existingGame) {
        throw new Error('Le joueur est déjà impliqué dans une partie en cours');
      }
    }
    else if (!player_2_id)
    {

    }

    const newGameHistory = new GameHistory();
    newGameHistory.game_id = game_id;
    newGameHistory.player_1_id = player_1_id;
    newGameHistory.player_2_id = player_2_id;
    newGameHistory.is_invited = player_2_id ? 1 : 0;

    return await this.gameHistoryRepository.save(newGameHistory);
  }

  async matchmaking(
    game_id: number,
    player_1_id: number,
    player_2_id: number,
    is_mode_spectator: number,
    max_scores: number,
    is_ai: number,
    mode: number,
  ): Promise<any> 
  {

    //invite
    if (player_1_id && player_2_id)
    {
      const existingGame = await this.gameHistoryRepository.findOne({
        where: [
          { player_1_id, player_2_id, status: 0 },
          { player_1_id, status: 1 },
          { player_2_id, status: 1 },
        ],
      });

      if (existingGame) {
        throw new Error('Le joueur est déjà impliqué dans une partie en cours');
      }
    }
    else if (!player_2_id)
    {
      // Recherche d'une partie où player_1_id est impliqué en tant que joueur 1 ou joueur 2, avec un statut de 0 ou 1
      let gameHistory = await this.gameHistoryRepository.findOne({
          where: [
              { player_1_id, status: 0 },
              { player_2_id: player_1_id, status: 0 },
              { player_1_id, status: 1 },
              { player_2_id: player_1_id, status: 1 },
          ],
      });
      if (gameHistory) {
        throw new Error('Le joueur est déjà impliqué dans une partie en cours');
      }
      
      if (!player_2_id)
      {
        gameHistory = await this.gameHistoryRepository.findOne({
            where: [
                {status: 0 },
            ],
        });

        if (gameHistory)
        {
          gameHistory.player_2_id = player_1_id
          gameHistory.status = 1;
          // gameHistory.is_mode_spectator = is_mode_spectator ? is_mode_spectator : 0; 
          // gameHistory.max_scores = max_scores ? max_scores : 2 
        
          await this.gameHistoryRepository.save(gameHistory);
          
          gameHistory = await this.gameHistoryRepository.findOne({
            where: {
                id: gameHistory.id,
            }
          });

          return gameHistory
        }
      }
    }

      try {
        const newGameHistory = new GameHistory();
        newGameHistory.game_id = game_id;
        newGameHistory.player_1_id = player_1_id;
        newGameHistory.player_2_id = player_2_id ? player_2_id : null;
        newGameHistory.is_mode_spectator = is_mode_spectator ? is_mode_spectator : 0;
        newGameHistory.is_invited = player_2_id ? 1 : 0;
        newGameHistory.max_scores = max_scores ? max_scores : 4
        newGameHistory.is_ai = is_ai ? 1 : 0
        newGameHistory.mode = mode ? mode : 5    
    
        if (newGameHistory.player_2_id)
          newGameHistory.status = 0
        if (newGameHistory.is_ai)
          newGameHistory.status = 1
    
        return await this.gameHistoryRepository.save(newGameHistory);
    } catch (error) {
        // Handle the error here, e.g., logging or throwing a custom error
        console.error("An error occurred while saving game history:", error);
        throw error; // Rethrow the error to propagate it further if needed
    }
  
  }

  async delete(id: number): Promise<any> 
  {
    const gameHistory = await this.findById(id);
    if (!gameHistory) {
      throw new NotFoundException('Historique de jeu non trouvé');
    }
    await this.gameHistoryRepository.remove(gameHistory);
    let tmp = {
      ...gameHistory,
      id: id
    }
    return tmp;
  }

  async searchByStatus(status: number): Promise<GameHistory[]> {
    return await this.gameHistoryRepository.find({ where: { status } });
  }

    
  async updateModeSpectator(id: number, is_mode_spectator: number): Promise<GameHistory> {
  
    const existingGame = await this.gameHistoryRepository.findOne({
      where: { id, status: In([0, 1]) },
    });

    if (!existingGame) {
      throw new Error('La partie n\'existe pas ou le statut n\'est pas valide');
    }
    existingGame.is_mode_spectator = is_mode_spectator;

    return await this.gameHistoryRepository.save(existingGame);
  }

    
  async updateStatus(id: number, status: number): Promise<GameHistory> {
  
    const existingGame = await this.gameHistoryRepository.findOne({
      where: { id },
    });

    if (!existingGame) {
      throw new Error('La partie n\'existe pas ou le statut n\'est pas valide');
    }
    existingGame.status = status;

    return await this.gameHistoryRepository.save(existingGame);
  }

  async acceptInvitation(gameHistoryId: number, player2Id: number): Promise<GameHistory> {
    const gameHistory = await this.gameHistoryRepository.findOne({
      where: { id: gameHistoryId },
    });
  
    if (!gameHistory) {
      throw new Error('Game history not found');
    }
  
    if (gameHistory.player_2_id !== player2Id) {
      throw new Error('Le joueur n\'est pas dans la partie.');
    }
  
    if (gameHistory.status !== 0 || gameHistory.is_invited !== 1) {
      throw new Error('Invalid game history status or invitation');
    }
  
    gameHistory.status = 1;
    return this.gameHistoryRepository.save(gameHistory);
  }

  async joinGame(gameId: number, playerId: number): Promise<GameHistory> {
    // Vérifier si le joueur existe dans une partie en cours
    const existingGame = await this.gameHistoryRepository.findOne({
      where: [
        { player_1_id: playerId, status: Not(2) }, 
        { player_2_id: playerId, status: Not(2) },
      ],
    });
  
    if (existingGame) {
      throw new Error('Le joueur est déjà dans une partie en cours');
    }
  
    // Vérifier s'il y a une partie disponible
    const availableGame = await this.gameHistoryRepository.findOne({
      where: { status: 0, is_invited: Not(1) },
    });
  
    if (availableGame) {
      // Mettre à jour la partie disponible avec le joueur 2
      availableGame.player_2_id = playerId;
      availableGame.status = 1;
      return this.gameHistoryRepository.save(availableGame);
    } else {
      // Créer une nouvelle partie
      const newGameHistory = new GameHistory();
      newGameHistory.game_id = gameId;
      newGameHistory.player_1_id = playerId;
      return this.gameHistoryRepository.save(newGameHistory);
    }
  }

  async updateEnd(id: any, data: any): Promise<any>
  {
    const gameHistory = await this.gameHistoryRepository.findOne({
      where: { status: 1, id: id},
    });

    if (!gameHistory) {
      throw new Error('Game history not found');
    }

    console.log(data)

    gameHistory.status = 2
    if (data.is_give_up)
      gameHistory.is_give_up = data.is_give_up ? 1 : 0

    if (data.score)
    {
      if (data.score.player_1 > data.score.player_2)
        gameHistory.winner_id = gameHistory.player_1_id
      else if (data.score.player_2 > data.score.player_1)
        gameHistory.winner_id = gameHistory.player_2_id
    }

    if (gameHistory.is_give_up 
      && gameHistory.is_give_up === gameHistory.player_1_id)
      gameHistory.winner_id = gameHistory.player_2_id
    else if (gameHistory.is_give_up 
      && gameHistory.is_give_up === gameHistory.player_2_id)
      gameHistory.winner_id = gameHistory.player_1_id
    
      return this.gameHistoryRepository.save(gameHistory);
  }
  


  async userHistory(player_id: number):Promise<GameHistory[]> {
    return await this.gameHistoryRepository.find({
        where: [
            { player_1_id: player_id, status: 2, },
            { player_2_id: player_id, status: 2, }
        ]
    });
  }

  async userInfoTotal(player_id: number): Promise<{ totalWin: number, totalLose: number, totalGames: number }> {

    const totalGames = await this.gameHistoryRepository.count({
      where: [
        { player_1_id: player_id, status: 2 },
        { player_2_id: player_id, status: 2 },
      ],
    });

    const totalWin = await this.gameHistoryRepository.count({
      where: { winner_id: player_id },
    });
  
    const totalLose = totalGames - totalWin;
  
    return { totalWin, totalLose, totalGames };
  }

  async userInfoWeek(player_id: number): Promise<{ day: string, total: number, total_win: number }[]> {
    // Obtenir la date d'il y a une semaine
    const dateAWeekAgo = new Date();
    dateAWeekAgo.setDate(dateAWeekAgo.getDate() - 7);

    // Récupérer les données de la semaine dernière pour le joueur spécifié
    const gameHistories = await this.gameHistoryRepository.find({
      where: [
        { player_1_id: player_id, status: 2, created_at: LessThanOrEqual(dateAWeekAgo) },
        { player_2_id: player_id, status: 2, created_at: LessThanOrEqual(dateAWeekAgo) },
      ],
    });

    // Initialiser un tableau pour stocker les résultats par jour
    const resultByDay: { [key: string]: { total: number, total_win: number } } = {
      Sunday: { total: 0, total_win: 0 },
      Monday: { total: 0, total_win: 0 },
      Tuesday: { total: 0, total_win: 0 },
      Wednesday: { total: 0, total_win: 0 },
      Thursday: { total: 0, total_win: 0 },
      Friday: { total: 0, total_win: 0 },
      Saturday: { total: 0, total_win: 0 },
    };

    // Remplir le tableau avec les données de la semaine dernière
    gameHistories.forEach(history => {
      const dayOfWeek = new Date(history.created_at).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      resultByDay[dayName].total++;
      if (history.winner_id === player_id) {
        resultByDay[dayName].total_win++;
      }
    });

    // Convertir le tableau en format attendu
    const result = Object.keys(resultByDay).map(day => ({
      day,
      total: resultByDay[day].total,
      total_win: resultByDay[day].total_win,
    }));

    return result;
  }


  async getWeeklyPlayerStats(player_id: number): Promise<any[]> {
    
    // Obtenir la date du début de la semaine actuelle (dimanche)
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Obtenir la date de la fin de la semaine actuelle (samedi)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const gameHistories = await this.gameHistoryRepository.find({
      where: [
        { player_1_id: player_id, status: 2, created_at: Between(startOfWeek, endOfWeek) },
        { player_2_id: player_id, status: 2, created_at: Between(startOfWeek, endOfWeek) },
      ],
    });

    // Initialiser un tableau pour stocker les résultats par jour
    const resultByDay: { [key: string]: { total: number, total_win: number } } = {
      Sunday: { total: 0, total_win: 0 },
      Monday: { total: 0, total_win: 0 },
      Tuesday: { total: 0, total_win: 0 },
      Wednesday: { total: 0, total_win: 0 },
      Thursday: { total: 0, total_win: 0 },
      Friday: { total: 0, total_win: 0 },
      Saturday: { total: 0, total_win: 0 },
    };

    // Remplir le tableau avec les données de la semaine dernière
    gameHistories.forEach(history => {
      const dayOfWeek = new Date(history.created_at).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      resultByDay[dayName].total++;
      if (history.winner_id === player_id) {
        resultByDay[dayName].total_win++;
      }
    });

    // Convertir le tableau en format attendu
    const result = Object.keys(resultByDay).map(day => ({
      day,
      total: resultByDay[day].total,
      total_win: resultByDay[day].total_win,
    }));

    return result;
  }
}
