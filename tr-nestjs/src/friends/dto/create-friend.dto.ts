import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  friendId: number;
}
