import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendController } from './friends.controller';
import { FriendService } from './friends.service';
import { Friend } from './friends.entity';
import { User } from '../users/users.entity';
// import { FriendGateway } from './friends.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User]),],
  controllers: [FriendController],
  providers: [
    FriendService, 
    // FriendGateway, 
  ], 
})
export class FriendsModule {}
