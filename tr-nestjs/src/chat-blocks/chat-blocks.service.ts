import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CreateChatBlockDto } from './dto/create-chat-block.dto';
import { UpdateChatBlockDto } from './dto/update-chat-block.dto';
import { ChatBlock } from './chat-blocks.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChatBlockService {
  constructor(
    @InjectRepository(ChatBlock)
    private readonly chatBlockRepository: Repository<ChatBlock>,
  ) {}

  async findAll(): Promise<ChatBlock[]> {
    return await this.chatBlockRepository.find(); 
  }

  async findAllUBlockinUser(blockingUserId): Promise<ChatBlock[]> 
  {
    return await this.chatBlockRepository.find({
      where: {
        blocking_user_id: blockingUserId,
      },
    });
  }

  async findById(id: number): Promise<ChatBlock> {
  const user = await this.chatBlockRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Channel non trouvé');
    }
    return user;
  }

  async create(blockingUserId: number, blockedUserId: number): Promise<ChatBlock> {
    const existingBlock = await this.chatBlockRepository.findOne({
      where: {
        blocking_user_id: blockingUserId,
        blocked_user_id: blockedUserId,
      },
    });

    if (existingBlock) {
      return existingBlock;
    }

    const newBlock = new ChatBlock();
    newBlock.blocking_user_id = blockingUserId;
    newBlock.blocked_user_id = blockedUserId;
    newBlock.created_at = new Date();
    newBlock.updated_at = new Date();

    return await this.chatBlockRepository.save(newBlock);
  }

  async delete(id: number): Promise<any> 
  {
    const existingBlock = await this.chatBlockRepository.findOne({
      where: {
        id: id,
      },
    });
    const result = await this.chatBlockRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    existingBlock.id = id
    return existingBlock;
  }
}