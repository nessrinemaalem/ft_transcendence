import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateGameHistoryDto {
  @IsNumber()
  @IsNotEmpty()
  player_1: number;

  @IsNumber()
  @IsNotEmpty()
  player_2: number;

  @IsNumber()
  @IsNotEmpty()
  game: number;

  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsNumber()
  @IsOptional()
  winner_id?: number | null;
}
