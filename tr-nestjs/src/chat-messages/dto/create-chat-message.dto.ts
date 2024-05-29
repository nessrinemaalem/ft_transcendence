import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsNumber()
  channelId?: number; 

  @IsOptional()
  @IsNumber()
  userId?: number;
  
}
