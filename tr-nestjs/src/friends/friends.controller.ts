import { Body, Controller, Delete, Get, 
  HttpException, HttpStatus, Param, Post, Put, Patch,
  Req, Res, UseGuards,
} from '@nestjs/common';
import { FriendService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './friends.entity';
import { validate } from 'class-validator'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity'; 
import { Request, Response } from 'express'; 
import { SessionAuthGuard } from './../session-auth.guard';
// import { FriendGateway } from './friends.gateway'; 
 
@Controller('friends')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    // private readonly friendGateway: FriendGateway, 
  ) {}

  @Get()
  async test(
    @Req() request: Request,
    @Res() res: Response
  ): Promise<void> {
    try {
      res.status(200).json({ data: 'user' });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }


  @Get(':id')
  async index(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') userId: number
  ): Promise<void> {
    try {
      const friends =  await this.friendService.findAll(userId);
      res.status(200).json({ data: friends });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }
  
  @Post(':id/store')
  async store(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') userId: number,
    @Body() data: { 
      id_friend: number, 
    }
  ): Promise<void> {
    try {
      const friend = await this.friendService.create(
        userId,
        data.id_friend,
      );

      // envoyer event websocket
      // await this.friendGateway.handleControllerFriends({userId});
      // await this.friendGateway.handleControllerFriends({userId:  data.id_friend});

      res.status(200).json({ friend: friend });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }   
  }

  @Patch(':id/update-status')
  async updateStatus(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') userId: number,
    @Body() data: { 
      id_friend: number,
      status: number,
    }
  ): Promise<void> {
    try {
      const friend = await this.friendService.updateStatus(userId, data.id_friend, data.status);

      // envoyer event websocket
      // await this.friendGateway.handleControllerFriends({userId});
      // const id_friend = friend.user_1_id == userId ? friend.user_2_id : friend.user_1_id
      // await this.friendGateway.handleControllerFriends({userId: id_friend});

      res.status(200).json({ friend: friend });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
    
  }

  @Post(':id/destroy')
  async destroy(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') userId: number,
    @Body() data: { 
      id_friend: number,
    }
  ): Promise<void> {
    try {
      const friend = await this.friendService.delete(userId, data.id_friend);

      // envoyer event websocket
      // await this.friendGateway.handleControllerFriends({userId});
      // const id_friend = d.friend.user_1_id == userId ? d.friend.user_2_id : d.friend.user_1_id
      // await this.friendGateway.handleControllerFriends({userId: id_friend});

      res.status(200).json({ friend: friend });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }

  @Post('search')
  async search(
    @Req() request: Request,
    @Res() res: Response,
    @Body() searchQuery: { username: string }
  ): Promise<void> {
    try {
      const { username } = searchQuery;
      const user = await this.friendService.search(username)
      res.status(200).json({friend: user});
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }

  // @Post('sql-injection')
  // async testSqlInjection(@Body() data: { username: string }) {
  //   const { username } = data;
  //   const result = await this.friendService.searchTestSqlInjection(username);
  //   return result;
  // }
}
