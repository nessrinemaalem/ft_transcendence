import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignController } from './sign.controller';
import { SignService } from './sign.service';
import { User } from '../users/users.entity';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([User])],
  controllers: [SignController],
  providers: [SignService],
  
})
export class SignModule {}
