import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
