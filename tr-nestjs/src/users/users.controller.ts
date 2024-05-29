import { 
  Controller, 
  NotFoundException, HttpException, HttpStatus, 
  Param, Body,
  Post, Put, Delete, Get, Patch, 
  UploadedFile, UseInterceptors,BadRequestException,
  UseGuards, Req, Res,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SessionAuthGuard } from './../session-auth.guard';
import { Request, Response } from 'express'; 
import { GameHistoryService } from 'src/games-history/games-history.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly gameHistoryService: GameHistoryService, 
  ){}

  @Get()
  async index(
    @Req() request: Request,
    @Res() res: Response
  ): Promise<void> {
    try {
      const data = await this.userService.findAll();
      res.status(200).json({ users: data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  }

  @Get(':id')
  async show(@Param('id') userId: number): Promise<User> {
    try {
      return await this.userService.findById(userId);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/more')
  async showMore(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number
  ): Promise<void> 
  {
    try {
      const user = await this.userService.findById(userId);
      const userHistory = await this.gameHistoryService.userHistory(userId)
      const userInfoTotal = await this.gameHistoryService.userInfoTotal(userId)
      const userInfoWek = await this.gameHistoryService.userInfoWeek(userId)
      res.status(200).json({ 
        user: user,
        userHistory: userHistory,
        userInfo: {
          total: userInfoTotal,
          week: userInfoWek,
        }
      });
    } 
    catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Post('/store')
  async store(@Body() createUserDto: CreateUserDto): Promise<User> {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      const errorMessage = Object.values(errors[0].constraints)[0];
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    return this.userService.create(createUserDto);
  }

  @Put(':id/update')
  async update(@Param('id') userId: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const errors = await validate(updateUserDto);
      if (errors.length > 0) {
        const errorMessage = Object.values(errors[0].constraints)[0];
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }
      return await this.userService.update(userId, updateUserDto);
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id/destroy')
  async destroy(@Param('id') userId: number): Promise<{ message: string }> {
    try {
      await this.userService.delete(userId);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  // ---

  @Patch(':id/update-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB maximum
      },
    })
  )
  async updateAvatar(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<void> {

    try {

      const user = await this.userService.updateAvatar(userId, avatar);

      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }

    // if (!avatar) {
    //   throw new BadRequestException('Avatar non fourni');
    // }
    // try {
    //   return await this.userService.updateAvatar(userId, avatar);
    // } catch (error) {
    //   if (error instanceof NotFoundException) {
    //     throw new NotFoundException('Utilisateur non trouvé');
    //   } else {
    //     throw error;
    //   }
    // }
  }

  @Patch(':id/update-username')
  async updateUsername(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number,
    @Body() data: { username: string }
  ): Promise<void> 
  {

    try {

      const user = await this.userService.updateUsername(userId, data.username);

      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Patch(':id/update-email')
  async updateEmail(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number,
    @Body() data: { email: string }
  ): Promise<void> 
  {

    try {

      const user = await this.userService.updateEmail(userId, data.email);

      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

  @Patch(':id/update-password')
  async updatePassword(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number,
    @Body() data: { 
      password: string,
      password_confirmation: string 
    }
  ): Promise<void> {

    try {

      const user = await this.userService.updatePassword(
        userId, data.password, data.password_confirmation
      );

      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }

  }

  @Patch(':id/update-2fa')
  async update2fa(
    @Req() request: Request,
    @Res() res: Response, 
    @Param('id') userId: number,
    @Body() data: { 
      is_2fa: number, 
    }
  ): Promise<void> {

    try {

      const user = await this.userService.update2fa(
        userId,
        data.is_2fa,
      );

      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue' });
      }
    }
  }

}
