import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateFriendDto {
  @IsNumber()
  userId?: number;
  
  @IsNumber()
  friendId?: number;

  @IsNumber()
  status: number
}
