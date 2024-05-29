import { Injectable, HttpException, HttpStatus,
  NotFoundException, UnauthorizedException, 
  ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CreateChatChannelDto } from './dto/create-chat-channel.dto';
import { UpdateChatChannelDto } from './dto/update-chat-channel.dto';
import { ChatChannel, ChatChannelAdministrator, ChatChannelMember, } from './chat-channels.entity';
import { User } from '../users/users.entity'; 

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChatChannelService {
  constructor(
    @InjectRepository(ChatChannel)
    private readonly chatChannelRepository: Repository<ChatChannel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatChannelAdministrator)
    private readonly adminRepository: Repository<ChatChannelAdministrator>,
    @InjectRepository(ChatChannelMember)
    private readonly memberRepository: Repository<ChatChannelMember>,
  ) {}

  async findAll(): Promise<ChatChannel[]> {
    return await this.chatChannelRepository.find(); 
  }

  async findAllWithStats(): Promise<any[]> {
    const channels = await this.chatChannelRepository.createQueryBuilder('channel')
      .leftJoin(ChatChannelAdministrator, 'administrators', 'administrators.chat_channel_id = channel.id')
      .addSelect('COUNT(DISTINCT administrators.user_id)', 'administrators_total')
      .leftJoin(ChatChannelMember, 
        'members', 
        'members.chat_channel_id = channel.id AND members.is_banned = 0')
      .addSelect('COUNT(DISTINCT members.user_id)', 'members_total')
      .groupBy('channel.id')
      .getRawMany();
  
    return channels;
  }
  
  async findById(id: number): Promise<ChatChannel> {
    const user = await this.chatChannelRepository.findOneBy({ id });
  
    if (!user) {
      throw new NotFoundException('Channel non trouvé');
    }
    return user;
  }

  async findChannelUserById(channelId: number, userId: any): Promise<any> {
    const channel = await this.chatChannelRepository.findOneBy({ id: channelId });
  
    if (!channel) {
      throw new NotFoundException('Channel non trouvé');
    }

    const member = await this.memberRepository.findOne({
      where: { user_id: userId },
    });

    if (!member) {
      throw new NotFoundException('Channel Member non trouvé');
    }

    const admin = await this.adminRepository.findOne({
      where: { user_id: member.user_id, chat_channel_id: channelId },
    });

    return {
      ...channel,
      member: member,
      admin: admin,
    };
  }

  async create(
    name: string,
    password: string,
    privacy: number,
    owner_id: number
  ): Promise<any> 
  {
   
    const owner = await this.userRepository.findOneBy({ id: owner_id });
    
    if (!owner) {
      throw new HttpException('Channel Owner non trouvé', HttpStatus.CONFLICT);
    }

    let hashedPassword = ''
    if (password)
        hashedPassword = await bcrypt.hash(password, 10);

    try {
      
      const savedChannel = await this.chatChannelRepository.save({
        name: name,
        password: hashedPassword,
        privacy: privacy,
        owner_id: owner_id,
      });
      
      const newAdmin = new ChatChannelAdministrator();
      newAdmin.chat_channel_id = savedChannel.id;
      newAdmin.user_id = owner_id;
      newAdmin.created_at = new Date();
      newAdmin.updated_at = new Date();
      await this.adminRepository.save(newAdmin);

      return savedChannel;

    } catch (error) {
        throw error;
    }
  }

  async update(
    id: number,
    name: string,
    password: string,
    privacy: number,
    owner_id: number
  ): Promise<any> 
  {

    const channel = await this.chatChannelRepository.findOneBy({ id });
  
    if (!channel) {
      throw new NotFoundException('Channel non trouvé');
    }

    let hashedPassword = ''
    if (password)
        hashedPassword = await bcrypt.hash(password, 10);

    channel.name = name
    channel.password = hashedPassword
    channel.privacy = privacy

    return this.chatChannelRepository.save(channel);
  }

  async delete(id: number): Promise<any> 
  {
  
    const channel = await this.chatChannelRepository.findOneBy({ 
      id 
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    try {
      await this.adminRepository.delete({ chat_channel_id: id });
      await this.memberRepository.delete({ chat_channel_id: id });
      const result = await this.chatChannelRepository.delete(id);
      console.log("Delete result:", result);
      return { channel: channel, message: 'Channel deleted successfully' };
    } catch (error) {
      console.error("Error deleting channel:", error);
      throw new Error('Failed to delete channel');
    }
  }

  async join(
      channelId: number, 
      userId: number, 
      password: string
    ): Promise<any> {
   
    let channel = await this.chatChannelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Chaîne introuvable');
    }

    if (channel.privacy === 1) {
        throw new UnauthorizedException('Channel Privé!');
    }

    if (channel.privacy === 2) {

      const passwordMatch = await bcrypt.compare(password, channel.password);
  
      if (!passwordMatch) {
        throw new UnauthorizedException('Mot de passe incorrect');
      }
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isMember = await this.memberRepository
      .createQueryBuilder('member')
      //.where('member.chat_channel_id = :channelId', { channelId })
      .andWhere('member.user_id = :userId', { userId })
      .getCount();

    let existingMember = null

    if (isMember > 0) {

      existingMember = await this.memberRepository.findOne({
        where: { chat_channel_id: channelId, user_id: userId }
      });
  
      if (existingMember && existingMember.is_banned) {
        throw new UnauthorizedException('Vous êtes banni de cette chaîne');
      }

      if (!existingMember)
        await this.leaveCurrentChannel(userId);
    }

    if (!existingMember)
    {
      const newMember = new ChatChannelMember();
      newMember.chat_channel_id = channelId;
      newMember.user_id = userId;
      await this.memberRepository.save(newMember);
    }

    channel = await this.findChannelUserById(channel.id, userId)

    return channel;
  }

  async leaveCurrentChannel(userId: number): Promise<void> {
    const members = await this.memberRepository.find({ where: { user_id: userId } });
  
    if (members.length > 0) {
      for (const member of members) {
        const channelId = member.chat_channel_id;
        await this.memberRepository.remove(member);
        //console.log(`L'utilisateur avec l'ID ${userId} a été retiré de la chaîne avec l'ID ${channelId}`);
      }
    } else {
      throw new NotFoundException('Aucun membre trouvé pour cet utilisateur');
    }
  }
  
  async leave(channelId: number, userId: number): Promise<any> 
  {
    const channel = await this.chatChannelRepository.findOne({
      where: { id: channelId },
    });
  
    if (!channel) {
      throw new NotFoundException('Chaîne introuvable');
    }
  
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
  
    const member = await this.memberRepository.findOne({ where: { chat_channel_id: channelId, user_id: userId } });
  
    if (member) {
      await this.memberRepository.remove(member);
      return member;
    }
  
    throw new NotFoundException('Membre introuvable');
  }

  async findAdminsByChannelId(channelId: number): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .innerJoin(ChatChannelAdministrator, 'admin', 'user.id = admin.user_id')
      .where('admin.chat_channel_id = :channelId', { channelId })
      .getMany();
  }
  
  // async findMembers(channelId: number): Promise<User[]> {
  //   const membersWithDetails = await this.memberRepository
  //     .createQueryBuilder('memberChannel')
  //     .innerJoinAndSelect('memberChannel.user', 'user')
  //     .where('memberChannel.chat_channel_id = :channelId', { channelId })
  //     .select([
  //       'user.id',
  //       'user.username',
  //       'user.status',
  //       'memberChannel.is_banned',
  //       'memberChannel.is_muted',
  //     ])
  //     .getMany();

  //   return membersWithDetails.map(member => member.user);
  // }

  async findMembers(channelId: number): Promise<any[]> {
    const members = await this.memberRepository.find({
      where: { chat_channel_id: channelId },
      relations: ['user'], 
    });
    return members;
  }


  async memberKick(channelId: number, user_id: number): Promise<void> {

    const member = await this.memberRepository.findOne({
      where: { chat_channel_id: channelId, user_id },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this channel');
    }

     // Vérifier si le membre est un administrateur
     const channel = await this.chatChannelRepository.findOne({
      where: { id: channelId },
    });

    if (channel.owner_id === user_id) {
      throw new UnauthorizedException('Admins cannot be kicked');
    }

    await this.memberRepository.delete({ chat_channel_id: channelId, user_id });
  }

  async memberBan(channelId: number, user_id: number, is_banned: number): Promise<void> {

    const member = await this.memberRepository.findOne({
      where: { chat_channel_id: channelId, user_id },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this channel');
    }

     // Vérifier si le membre est un administrateur
     const channel = await this.chatChannelRepository.findOne({
      where: { id: channelId },
    });

    if (channel.owner_id === user_id) {
      throw new UnauthorizedException('Admins cannot be banned');
    }

    member.is_banned = is_banned;
    await this.memberRepository.save(member);
  }

  async memberMute(channelId: number, user_id: number, is_muted: number): Promise<any> {
    
    const member = await this.memberRepository.findOne({
      where: { chat_channel_id: channelId, user_id },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this channel');
    }

     // Vérifier si le membre est un administrateur
    const channel = await this.chatChannelRepository.findOne({
      where: { id: channelId },
    });

    if (channel.owner_id === user_id) {
      throw new UnauthorizedException('Admins cannot be muted');
    }

    try
    {
      member.is_muted = is_muted;
      await this.memberRepository.save(member);
    }
    catch(error: any)
    {
      console.log('error', error)
    }

    return member
  }


  async addAdmin(channelId: number, ownerId: number, adminId: number): Promise<ChatChannel> {
  
    const channel = await this.chatChannelRepository.findOne({
      where: {
        id: channelId,
      },
      relations: {
        owner: true,
        //administrators: true,
      }
    });
    if (!channel || channel.owner.id !== ownerId) {
        throw new NotFoundException('Chaîne introuvable ou propriétaire non autorisé.');
    }

    //console.log(channel)

    const adminUser = await this.userRepository.findOneBy({ id: adminId });
    if (!adminUser) {
        throw new NotFoundException('Utilisateur à ajouter non trouvé.');
    }

    //console.log("admin", adminUser)

    const existingAdmin = await this.adminRepository.findOne({
        where: {
          chat_channel_id: channelId,
          user_id: adminId,
        }
    });

    //console.log(existingAdmin)

    if (existingAdmin) {
        throw new ConflictException('Utilisateur déjà administrateur de la chaîne.');
    }

    const newAdmin = new ChatChannelAdministrator();
    newAdmin.chat_channel_id = channelId;
    newAdmin.user_id = adminId;
    newAdmin.created_at = new Date();
    newAdmin.updated_at = new Date();
    
    console.log(newAdmin)

    await this.adminRepository.save(newAdmin);

    return channel;
  }

  async adminsDestroy(channelId: number, ownerId: number, adminId: number)
    : Promise<ChatChannel> 
  {
    const isAdminOwner = await this.adminRepository.findOne({
      where: {
        chat_channel_id: channelId,
        user_id: ownerId,
      },
    });
  
    if (!isAdminOwner) {
      throw new NotFoundException('Seul le propriétaire peut supprimer des administrateurs.');
    }
  
    await this.adminRepository
      .createQueryBuilder()
      .delete()
      .from(ChatChannelAdministrator)
      .where('chat_channel_id = :channelId', { channelId })
      .andWhere('user_id = :adminId', { adminId: adminId })
      .execute();
  
    return await this.chatChannelRepository.findOneBy({
      id: channelId,
    });
  }


}
