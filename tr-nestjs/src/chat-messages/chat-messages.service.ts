import { Injectable, NotFoundException, 
  ConflictException, BadRequestException,
  InternalServerErrorException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Not, In } from 'typeorm';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { ChatMessage } from './chat-messages.entity';
import { User } from '../users/users.entity';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember } from '../chat-channels/chat-channels.entity';
import { ChatBlock } from '../chat-blocks/chat-blocks.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatChannel)
    private readonly chatChannelRepository: Repository<ChatChannel>,
    @InjectRepository(ChatChannelAdministrator)
    private readonly chatChannelAdministratorRepository: Repository<ChatChannelAdministrator>,
    @InjectRepository(ChatChannelMember)
    private readonly chatChannelMemberRepository: Repository<ChatChannelMember>,
    @InjectRepository(ChatBlock)
    private readonly chatBlockRepository: Repository<ChatBlock>,  
  ) {}

  async findAll(): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      order: {
        updated_at: "DESC"
      }
    }); 
  }

  async findAllForUser(userId: number): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: [
        { user_from_id: userId },
        { user_to_id: userId },
      ],
    });
  }

  async findAllForUserNotBlocked(userId: number): Promise<ChatMessage[]> {
    const blockedUserIds = await this.getBlockedUserIds(userId);
    return await this.chatMessageRepository.find({
      where: [
        { user_from_id: userId, user_to_id: Not(In(blockedUserIds)) },
        { user_to_id: userId, user_from_id: Not(In(blockedUserIds)) },
      ],
    });
  }

  async findAllForChannel(channelId: number): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: { channel_to_id: channelId },
      order: {
        updated_at: "DESC"
      },
      relations: ['channel_to',],
    });
  }

  // admin member ..
  // async findMessagesForChannel(channelId: number): Promise<any> {
  //   // Récupérer tous les messages du canal
  //   const messages = await this.findAllForChannel(channelId);
  //   const messages_set: any = []
  //   // Pour chaque message, récupérer les membres du canal et les ajouter au message lui-même
  //   console.log('messages==', messages.length)
  //   for (let message of messages) {
  //     // Vérifier si le message a un canal associé
  //     if (message.channel_to) {
  //       // Récupérer les membres du canal pour ce message
  //       const channelId = message.channel_to.id;
  //       const member = await this.chatChannelMemberRepository.findOne({
  //         where: { user_id: message.user_from_id },
  //       });
  //       const admin = await this.chatChannelAdministratorRepository.findOne({
  //         where: { user_id: member.user_id, chat_channel_id: channelId },
  //       });
  //       messages_set.push({
  //         ...message,
  //         member: member,
  //         admin: admin,
  //       })
  //     }
  //     else
  //     {
  //       messages_set.push({
  //         ...message,
  //         member: null,
  //         admin: null,
  //       })
  //     }
  //   }

  async findMessagesForChannel(channelId: number): Promise<any> {
    try {
      const messages = await this.findAllForChannel(channelId);
      const messages_set: any = [];
     
      for (let message of messages) {
        try {
          if (message.channel_to) {
            const channelId = message.channel_to.id;
            const member = await this.chatChannelMemberRepository.findOne({
              where: { user_id: message.user_from_id },
            });
            if (member)
            {
              const admin = await this.chatChannelAdministratorRepository.findOne({
                where: { user_id: member.user_id, chat_channel_id: channelId },
              });
              messages_set.push({
                ...message,
                member: member,
                admin: admin,
              });
            }
          } else {
            messages_set.push({
              ...message,
              member: null,
              admin: null,
            });
          }
        } catch (error) {
          console.error('Error fetching member or admin:', error);
          messages_set.push({
            ...message,
            member: null,
            admin: null,
          });
        }
      }
      return messages_set;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages for the channel');
    }
  }
  

  //   return messages_set;
  // }
  
  async findAllForChannelNotBlocked(
    channelId: number, userId: number
  ): Promise<ChatMessage[]> {
    const blockedUserIds = await this.getBlockedUserIds(userId);
    return await this.chatMessageRepository.find({
      where: { 
        channel_to_id: channelId,
        user_from_id: Not(In(blockedUserIds)),
      },
    });
  }
  
  private async getBlockedUserIds(userId: number): Promise<number[]> {
    const blockedUsers = await this.chatBlockRepository.find({
      where: { blocking_user_id: userId },
      select: ['blocked_user_id'],
    });
    return blockedUsers.map(block => block.blocked_user_id);
  }

  async findById(id: number): Promise<ChatMessage> {
  const user = await this.chatMessageRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Message non trouvé');
    }
    return user;
  }

  async findAllUserMessagesNotChannels(userId: number): 
    Promise<any> 
  {
    return this.chatMessageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user_from', 'user_from')
      .leftJoinAndSelect('message.user_to', 'user_to')
      .where('message.user_from_id = :userId AND (message.channel_to_id IS NULL OR message.channel_to_id = 0)', { userId })
      .getMany();
  }
  

  async create(
    from_id: number, 
    to_username: string, 
    channel_id: number, 
    message: string
  ): Promise<any> {
    try {

      if (!message) {
        throw new BadRequestException('Message is required');
      }
  
      console.log('data', from_id, to_username, channel_id, message)

      let recipientUser: User | undefined;
      let chatChannel: ChatChannel | undefined;
  
      if (to_username) {
        recipientUser = await this.userRepository.findOneBy({ username: to_username});
  
        if (!recipientUser) {
          throw new NotFoundException('Recipient user not found');
        }
      }

      if (recipientUser && from_id === recipientUser.id && recipientUser.id !== 0) {
        throw new BadRequestException('Sender and recipient cannot be the same user');
      }
  
      if (channel_id && !to_username) {
        chatChannel = await this.chatChannelRepository.findOneBy({ id: channel_id });
      
        if (!chatChannel) {
          throw new NotFoundException('Chat channel not found');
        }
        
        // Vérifier si l'utilisateur est membre du canal en utilisant une sous-requête
        const isUserMember = await this.chatChannelMemberRepository.findOne({
          where: { chat_channel_id: channel_id, user_id: from_id }
        });
      
        if (!isUserMember) {
          throw new UnauthorizedException('User is not a member of the chat channel');
        }

        if (isUserMember.is_muted)
        {
          throw new UnauthorizedException('User is mutted');
        }
      }
      
      const chatMessage = new ChatMessage();
      chatMessage.user_from_id = from_id;
      chatMessage.user_to_id = recipientUser ? recipientUser.id : null;
      chatMessage.channel_to_id = channel_id && !to_username ? channel_id : null;
      chatMessage.message = message;
      chatMessage.created_at = new Date();
      chatMessage.updated_at = new Date();
  
      return await this.chatMessageRepository.save(chatMessage);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  

  async update(id: number, message: string): Promise<ChatMessage> {
    const chatMessage = await this.chatMessageRepository.findOneBy({id});
    if (!chatMessage) {
      throw new NotFoundException('Message not found');
    }
    chatMessage.message = message;
    return await this.chatMessageRepository.save(chatMessage);
  }

  async delete(id: number): Promise<any> {
    const chatMessage = await this.chatMessageRepository.findOneBy({id});
    const result = await this.chatMessageRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return chatMessage;
  }
}
