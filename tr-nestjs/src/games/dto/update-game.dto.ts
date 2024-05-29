import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateGameDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
