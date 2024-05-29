import { Body, Controller, Delete, Get, 
  HttpException, HttpStatus, Param, Post, Put, 
  Req, Res, UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatBlockService } from './chat-blocks.service';
import { CreateChatBlockDto } from './dto/create-chat-block.dto';
import { UpdateChatBlockDto } from './dto/update-chat-block.dto';
import { ChatBlock } from './chat-blocks.entity';
import { validate } from 'class-validator';
import { GameGateway } from 'src/web-socket/socket.gateway';

@Controller('chat/blocks')
export class ChatBlockController {
  constructor(
      private readonly chatBlockService: ChatBlockService,
      private readonly gameGateway: GameGateway,  
    
    ) {}

  @Get()
  async index(): Promise<ChatBlock[]> {
    return await this.chatBlockService.findAll();
  }

  @Get(':id')
  async show(@Param('id') chatBlockId: number): Promise<ChatBlock> {
    try {
      return await this.chatBlockService.findById(chatBlockId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('store')
  async store(
    @Req() request: Request,
    @Res() res: Response,
    @Body() data: { 
      blocking_user_id: number,
      blocked_user_id: number,
    }
  ): Promise<void> {
    
    const { blocking_user_id, blocked_user_id } = data;

    try {

      const user_block = await this.chatBlockService.create(blocking_user_id, blocked_user_id);

      console.log('user_block', user_block)

      // envoyer event websocket
      await this.gameGateway.handleControllerUsersBlock(user_block);
      await this.gameGateway.handleControllerMessagesBlock(user_block);

      res.status(200).json({ user_block: user_block });

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
      @Param('id') chatBlockId: number): Promise<void>
    {
      try {
        
        const user_block = await this.chatBlockService.delete(chatBlockId);

        // envoyer event websocket
        await this.gameGateway.handleControllerUsersBlock(user_block);
        await this.gameGateway.handleControllerMessagesBlock(user_block);

        res.status(200).json({ user_block: user_block });
      } 
      catch (error) 
      {
        if (error instanceof HttpException) {
          res.status(error.getStatus()).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Une erreur est survenue' });
        }
      }
    }


  @Get('users/:id')
  async userList(@Param('id') userId: number): Promise<ChatBlock[]> {
    try {
      return await this.chatBlockService.findAllUBlockinUser(userId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }
}
