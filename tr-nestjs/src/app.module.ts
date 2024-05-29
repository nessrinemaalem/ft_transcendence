import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ChatModule } from './chat/chat.module';
import { ChatChannelsModule } from './chat-channels/chat-channels.module';
import { ChatMessagesModule } from './chat-messages/chat-messages.module';
import { ChatBlocksModule } from './chat-blocks/chat-blocks.module';
import { FriendsModule } from './friends/friends.module';
import { GameHistorysModule } from './games-history/games-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignModule } from './sign/sign.module';
//import { User } from './users/users.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { GameGateway } from './web-socket/socket.gateway';
import { GameService } from './games/games.service';
import { GameHistoryService } from './games-history/games-history.service';
import { GameHistory } from './games-history/games-history.entity';
import { Game } from './games/games.entity';
import { User } from './users/users.entity';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      // type: 'mysql',
      // host: 'localhost',
      // port: 3306,
      // username: 'root',
      // password: 'root',
      // database: 'test',
      // type: 'sqlite',
      // database: process.env.DB_NAME || 'db.sqlite',
      // //entities: [User],
      // synchronize: true,
      // autoLoadEntities: true,
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'mydatabase',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule, 
    GamesModule, GameHistorysModule,
    FriendsModule,
    ChatModule, ChatChannelsModule, ChatMessagesModule, ChatBlocksModule,
    SignModule,
    
    // https://nest-modules.github.io/mailer/docs/mailer
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        preview: true,
        template: {
          dir: __dirname + '/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
  ],
  exports: [
  ],
})
export class AppModule {}
