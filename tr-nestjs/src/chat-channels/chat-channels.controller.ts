import { Body, Controller, Delete, Get, 
  Patch, HttpException, NotFoundException, 
  HttpStatus, Param, Post, Put,
  Req, Res, UseGuards,
} from '@nestjs/common';
import { ChatChannelService } from './chat-channels.service';
import { CreateChatChannelDto } from './dto/create-chat-channel.dto';
import { UpdateChatChannelDto } from './dto/update-chat-channel.dto';
import { ChatChannel } from './chat-channels.entity';
import { User } from '../users/users.entity';
import { validate } from 'class-validator';
import { Request, Response } from 'express'; 
import { GameGateway } from 'src/web-socket/socket.gateway';

@Controller('chat/channels')
export class ChatChannelController {
  constructor(
    private readonly chatChannelService: ChatChannelService,
    private readonly gameGateway: GameGateway,
  ) {}

  @Get()
  async index(): Promise<ChatChannel[]> {
    return await this.chatChannelService.findAllWithStats();
  }

  @Get(':id')
  async show(@Param('id') chatChannelId: number): Promise<ChatChannel> {
    try {
      return await this.chatChannelService.findById(chatChannelId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('/store')
  async store(
    @Req() request: Request,
    @Res() res: Response,
    @Body() data: {
      name: string,
      password: string,
      privacy: number,
      owner_id: number, 
    }
  ): Promise<void> 
  {

    console.log('data', data)
    
    try {
      const channel = await this.chatChannelService.create(
        data.name,
        data.password,
        data.privacy,
        data.owner_id,
      );

      // envoyer event websocket
      await this.gameGateway.handleControllerChannels();

      res.status(200).json({ channel: channel });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }   
  }

  @Put(':id/update')
  async update(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') chatChannelId: number,
    @Body() data: {
      name: string,
      password: string,
      privacy: number,
      owner_id: number, 
    }
  ): Promise<void> {

    console.log('data', data)
    
    try {
      const channel = await this.chatChannelService.update(
        chatChannelId,
        data.name,
        data.password,
        data.privacy,
        data.owner_id,
      );

      // envoyer event websocket
      await this.gameGateway.handleControllerChannels();

      res.status(200).json({ channel: channel });
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
    @Param('id') chatChannelId: number,
  ): Promise<void> {

    try {
      const channel = await this.chatChannelService.delete(chatChannelId);

      // envoyer event websocket
      await this.gameGateway.handleControllerChannels();
   
      res.status(200).json({ channel: channel });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }

  // --- 

  @Post(':id/join')
  async join(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') chatChannelId: number,
    @Body() data: {
      user_id: number,
      password: string,
    }
  ): Promise<void>  
  {

    //console.log('data', data)
    
    try {

      const channel = await this.chatChannelService.join(
        chatChannelId, data.user_id, data.password
      );
      
      // on peut aussi ... join ici websocket ...
      await this.gameGateway.handleControllerChannelsJoin(chatChannelId, data.user_id,);
        
      res.status(200).json({ channel: channel });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }   
  }

  @Post(':id/leave')
  async leave(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') chatChannelId: number,
    @Body() data: {
      user_id: number,
    }
  ): Promise<void>  
  {
    try {

      const member = await this.chatChannelService.leave(
        chatChannelId, data.user_id,
      );
      
      // on peut aussi ... join ici websocket ...
      await this.gameGateway.handleControllerChannelsChannelLeaveKickBan(chatChannelId, data.user_id)
        
      res.status(200).json({ member: member });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }   
  }

  // -- MEMBERS

  @Get(':id/members')
  async members(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') channelId: number,
  ): Promise<void> 
  {
    try {
      const members = await this.chatChannelService.findMembers(channelId);; 
      
      // on peut aussi ... join ici websocket ...
      
        
      res.status(200).json({ members: members });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Post(':id/members/kick')
  async membersKick(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') channelId: number,
    @Body() data: { user_id: number },
  ): Promise<void> {

    try {
      const member = await this.chatChannelService.memberKick(channelId, data.user_id);
      
      // on peut aussi ... join ici websocket ...
      await this.gameGateway.handleControllerChannelsChannelLeaveKickBan(channelId, data.user_id)
        
      res.status(200).json({ member: member });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Patch(':id/members/ban')
  async membersBan(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') channelId: number,
    @Body() data: { user_id: number, is_banned: number },
  ): Promise<void> 
  {

    try {
      const member = await this.chatChannelService.memberBan(channelId, data.user_id, data.is_banned);
      
      // on peut aussi ... join ici websocket ...
      await this.gameGateway.handleControllerChannelsChannelLeaveKickBan(channelId, data.user_id)
        
      res.status(200).json({ member: member });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Patch(':id/members/mute')
  async membersMute(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') channelId: number,
    @Body() data: { user_id: number, is_muted: number },
  ): Promise<void> 
  {
    try {
      //console.log('mute  ...')
      const member = await this.chatChannelService.memberMute(channelId, data.user_id, data.is_muted);
      
      // on peut aussi ... join ici websocket ...
      await this.gameGateway.handleControllerChannelsChannel(channelId);
        
      res.status(200).json({ member: member });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

    // -- ADMINS

    @Get(':id/admins')
    async admins(
      @Req() request: Request,
      @Res() res: Response,
      @Param('id') channelId: number
    ): Promise<void> 
    {
      try {
        const admin  = await this.chatChannelService.findAdminsByChannelId(channelId);
        
        // on peut aussi ... join ici websocket ...
        //await this.gameGateway.handleControllerChannelsChannel(channelId);
          
        res.status(200).json({ admin: admin });
      } catch (error) {
        if (error instanceof HttpException) {
          res.status(error.getStatus()).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Une erreur est survenue' });
        }
      }   
    }
    
    @Post(':id/admins/store')
    async adminsStore(
      @Req() request: Request,
      @Res() res: Response,
      @Param('id') channelId: number,
      @Body() data: { owner_id: number; user_id: number }
    ): Promise<void> 
    {
      try {
        const { owner_id, user_id } = data;
  
        const admin  = await this.chatChannelService.addAdmin(channelId, owner_id, user_id);
        
        // on peut aussi ... join ici websocket ...
        await this.gameGateway.handleControllerChannelsChannelAdmin(channelId, user_id);
          
        res.status(200).json({ admin: admin });
      } catch (error) {
        if (error instanceof HttpException) {
          res.status(error.getStatus()).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Une erreur est survenue' });
        }
      }
    }
  
    @Post(':id/admins/destroy')
    async adminsDestroy(
      @Req() request: Request,
      @Res() res: Response,
      @Param('id') channelId: number, 
      @Body() data: { owner_id: number; admin_id: number }
    ): Promise<void> 
    {
      try {
        const { owner_id, admin_id } = data;
        const channel = await this.chatChannelService.adminsDestroy(
          channelId, owner_id, admin_id
        );
        
        // on peut aussi ... join ici websocket ...
        await this.gameGateway.handleControllerChannelsChannelAdmin(channelId, admin_id);
          
        res.status(200).json({ channel: channel });
      } catch (error) {
        if (error instanceof HttpException) {
          res.status(error.getStatus()).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Une erreur est survenue' });
        }
      }
    }
  
}
