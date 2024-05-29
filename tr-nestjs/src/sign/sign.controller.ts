import { Body, Controller, 
  HttpException, BadRequestException, HttpStatus, 
  Post,
  Session,
  Req, Res, Get, Redirect, Query,
} from '@nestjs/common';
import { SignService } from './sign.service';
import { Request, Response } from 'express';
import * as axios from 'axios';
import { MailerService } from '@nestjs-modules/mailer';
import { exec } from 'child_process';
import { GameGateway } from 'src/web-socket/socket.gateway';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@Controller('/')
export class SignController {
  constructor(
    private readonly signService: SignService,
    private readonly mailerService: MailerService,
    private readonly gameGateway: GameGateway,  
  ) {}

  // @Get('/sign-in-42')
  // redirectToExternalPage(@Res() res: Response): void {
  //   const externalUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1e04d51b2dadcbb6205da4b8d442c8f9aae0d7d6ac3a5becd2e51ed51727f967&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2F&response_type=code';
  //   res.redirect(externalUrl);
  // }

  @Get('/sign-up-42')
  async signUp42(@Query('code') code: string, @Res() res: Response): Promise<void> {
    try {
      if (!code) {
        throw new BadRequestException('Code not found');
      }

      const { accessToken } = await this.signService.exchangeCodeForToken(code);
      const userData = await this.signService.getUserData(accessToken);
      
      const { login, email, image } = userData;
      const avatar = image?.versions?.small;

      const result = await this.signService.signUp42New(login, email, avatar);

      console.log(code, "test ...", result)

      if (result.code) {
        
        const emailPromise = this.mailerService.sendMail({
          to: result.email,
          subject: 'Welcome to Nice App! Confirm your Email',
          template: './code',
          context: {
            code: result.code,
            name: result.username,
          },
        });

        //await Promise.all([emailPromise]);

        console.log('test 2...')

        res.json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching user data' });
    }
  }

  @Post('/sign-in')
  async signIn(
    @Body() data: { email: string, password: string },
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const result = await this.signService.signIn(data.email, data.password);
      

      if (result.code) {
        
        const emailPromise = this.mailerService.sendMail({
          to: result.email,
          subject: 'Welcome to Nice App! Confirm your Email',
          template: './code',
          context: {
            code: result.code,
            name: result.username,
          },
        });

        //await Promise.all([emailPromise]);

        console.log('test 2...')

        return response.send(result);
      }
      
      // Retourner uniquement la réponse JSON
      return response.send(result);
    } catch (error) {
      // Gérer les erreurs
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/sign-in-code')
  async signInCode(
    @Body() data: { email: string, code: string },
  ): Promise<any> {
    try {
      return await this.signService.signInCode(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/sign-up')
  async signUp(
    @Body() data: {
      login_42: string,
      username: string,
      email: string, 
      password: string,
      password_confirmation: string
    },
  ): Promise<any> {

    try {

      if(data.login_42 || data.login_42 !== '')
      {
        const { accessToken } = await this.signService.auth42();
        const url = `https://api.intra.42.fr/v2/users?filter[login]=${data.login_42}`
        const response = await axios.default.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        data.username = data.login_42
        data.email = response.data[0].email
        console.log(data, accessToken, response.data, url)
      }

      return await this.signService.signUp(data.username, data.email, data.password, data.password_confirmation);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/sign-out')
  async signOut(
    @Body() data: { user_id: number },
  ): Promise<any> {
    try {

      await this.signService.signOut(data.user_id);

      await this.gameGateway.handleControllerSignOut(data.user_id);

      return { message: 'Vous avez été déconnecté' };

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  @Post('/sign-in-check')
  async signCheck(
    @Body() data: { user_id: number },
    @Session() session: Record<string, any>,
    @Req() request: Request,
  ): Promise<any> {
    console.log(session, request.session)
    if (session.userId) {
      const user = await this.signService.signCheck(session.userId);
      return { user, message: 'hello' };
    } else {
      return { message: 'Utilisateur non connecté' };
    }
  }
}

