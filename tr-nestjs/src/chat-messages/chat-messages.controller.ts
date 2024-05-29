import { Body, Controller, Delete, Get, 
  HttpException, HttpStatus, Param, Post, Put,
  Req, Res, UseGuards,
} from '@nestjs/common';
import { ChatMessageService } from './chat-messages.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { ChatMessage } from './chat-messages.entity';
import { validate } from 'class-validator';
import { Request, Response } from 'express'; 
import { GameGateway } from 'src/web-socket/socket.gateway'; 

@Controller('chat/messages')
export class ChatMessageController {
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly gameGateway: GameGateway,  
  ) {}

  @Get()
  async index(): Promise<ChatMessage[]> {
    return await this.chatMessageService.findAll();
  }

  @Get(':id')
  async show(@Param('id') chatCMessageId: number): Promise<ChatMessage> {
    try {
      return await this.chatMessageService.findById(chatCMessageId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('/store')
  async store(
    @Req() request: Request,
    @Res() res: Response,
    @Body() data: { 
      from_id: number, 
      to_username: string,
      channel_id: number,
      message: string,
    }
  ): Promise<void> 
  {
    //console.log('data form', data)
    
    const { from_id, to_username, channel_id, message } = data;

    try {

      const msg = await this.chatMessageService.create(
        from_id, 
        to_username, 
        channel_id, 
        message,
      );

      //console.log('channel_message', msg)

      // envoyer event websocket
      await this.gameGateway.handleControllerMessages(msg);

      if (to_username)
        res.status(200).json({ message_user: msg });
      else
        res.status(200).json({ message_channel: msg });

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
    @Param('id') chatCMessageId: number,
    @Body() data: { 
      message: string,
    }
  ): Promise<ChatMessage> {
    try {
      
      return await this.chatMessageService.update(chatCMessageId, data.message);

    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id/destroy')
  async destroy(@Param('id') chatCMessageId: number): Promise<{ message: string }> {
    try {
      
      const msg = await this.chatMessageService.delete(chatCMessageId);
      
      // envoyer event websocket
      await this.gameGateway.handleControllerMessages(msg);
      
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Get('users/:id')
  async messagesUsers(@Param('id') userId: number): Promise<ChatMessage[]> {
    return await this.chatMessageService.findAllForUser(userId);
  }

  @Get('users/:id/not-blocked')
  async messagesUsersNotBlocked(@Param('id') userId: number): Promise<ChatMessage[]> {
    return await this.chatMessageService.findAllForUserNotBlocked(userId);
  }

  @Get('channels/:id')
  async messagesChannels(@Param('id') channelId: number): Promise<any[]> {
    return await this.chatMessageService.findMessagesForChannel(channelId);
  }

  @Post('channels/:id/not-blocked')
  async messagesChannelsNotBlocked(
    @Param('id') channelId: number,
    @Body() data: { 
      user_id: number,
    }
  ): Promise<ChatMessage[]> {
    return await this.chatMessageService.findAllForChannelNotBlocked(channelId, data.user_id);
  }

}
