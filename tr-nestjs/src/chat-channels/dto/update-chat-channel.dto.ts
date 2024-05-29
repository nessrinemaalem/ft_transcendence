import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateChatChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsNumber()
  privacy: number;
}
