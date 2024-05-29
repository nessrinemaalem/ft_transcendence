import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGameHistoryDto {
  @IsNumber()
  @IsNotEmpty()
  player_1: number;

  @IsNumber()
  @IsNotEmpty()
  player_2: number;

  @IsNumber()
  @IsNotEmpty()
  game: number;
}
