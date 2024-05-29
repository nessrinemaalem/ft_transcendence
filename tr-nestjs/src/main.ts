import * as session from 'express-session';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { UnauthorizedExceptionFilter } from './unauthorized-exception.filter';
import * as cors from 'cors';
import { GameService } from './games/games.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  //https://thriveread.com/how-to-enable-nestjs-cors/
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:3001',
      'https://api.intra.42.fr',
      'https://signin.intra.42.fr',
      'http://10.24.2.3',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });
  //app.enableCors();

  // app.use(cors({
  //   origin: 'http://localhost:8000',
  //   credentials: true, 
  // }));

  

  app.useGlobalFilters(new UnauthorizedExceptionFilter());


  const gameService = app.get(GameService);
  const createGameDto: any = {
    name: 'Pong',
    description: 'Pong ...', // Description du jeu
  };

  try {
    await gameService.createGameIfNotExists(createGameDto);
    console.log('Le projet Pong a été ajouté à la base de données.');
  } catch (error) {
    console.error('Une erreur s\'est produite lors de l\'ajout du jeu :', error);
  }

  const port = 8000; 
  await app.listen(port);
}
bootstrap();
