import { Injectable, NotFoundException, HttpException,
   HttpStatus, ConflictException, BadRequestException,
   Inject, forwardRef 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './friends.entity';
import { User } from '../users/users.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll(userId: number): Promise<Friend[]> {
    return await this.friendRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.user_1', 'user1')
      .leftJoinAndSelect('friend.user_2', 'user2')
      .where('friend.user_1_id = :userId OR friend.user_2_id = :userId', { userId })
      .getMany();
  }

  async create(
    userId: number, 
    friendId: number
  ): Promise<any> {
  
    //console.log("create ", userId, friendId)
    userId = parseInt(userId + '', 10);
    if (userId === friendId) {
      throw new HttpException('La relation d\'ami impossible', HttpStatus.CONFLICT);
    }

    let existingFriendship = await this.friendRepository.findOne({ where: { user_1_id: userId, user_2_id: friendId } });
    if (existingFriendship) {
      throw new HttpException('La relation d\'ami existe déjà', HttpStatus.CONFLICT);
    }

    existingFriendship = await this.friendRepository.findOne({ where: { user_1_id: friendId, user_2_id: userId } });
    if (existingFriendship) {
      throw new HttpException('La relation d\'ami existe déjà', HttpStatus.CONFLICT);
    }

    const newFriendship = {
      user_1_id: userId,
      user_2_id: friendId,
    };
    
    try {
      const savedFriendship = await this.friendRepository.save(newFriendship);

      return savedFriendship;
    } catch (error) {
      throw new HttpException('La relation d\'ami existe déjà', HttpStatus.CONFLICT);
    }
  }
  
  async updateStatus(userId: number, friendId: number, status: number): Promise<Friend> {
    try {
      const friend = await this.friendRepository.findOne({
        where: [
          { user_1_id: userId, id: friendId },
          { user_2_id: userId, id: friendId }
        ]
      });

      console.log('friend', friend)
      
      if (!friend) {
        throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
      }
      
      friend.status = status;
      return await this.friendRepository.save(friend);
    } catch (error) {
      throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
    }
  }

  async delete(userId: number, friendId: number): Promise<any> {
    const friend = await this.friendRepository.findOne({
      where: [
        { user_1_id: userId, id: friendId },
        { user_2_id: userId, id: friendId }
      ]
    });

    console.log('friend', friend)
    
    if (!friend) {
      throw new NotFoundException('Friend not found');
    }
    const id = friend.id
    const result = await this.friendRepository.remove(friend);
    friend.id = id
    return friend;
  }

  async search(username: string): Promise<any> {
    try {
      console.log('search', username)
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('Erreur lors de la recherche de l\'utilisateur', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async searchTestSqlInjection(username: string): Promise<User> {
    
  //   const injectedUsername = `${username}' OR '1'='1`;
  //   try {
  //     // Attention: Ce code est vulnérable aux injections SQL!
  //     const user = await this.userRepository
  //       .createQueryBuilder('user')
  //       .where(`user.username = '${injectedUsername}'`)
  //       .getOne();

  //     return user;
  //   } catch (error) {
  //     throw new HttpException('Erreur lors du test d\'injection SQL', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
