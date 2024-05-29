import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateChatChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  privacy: number;

  @IsNotEmpty()
  @IsNumber()
  owner_id: number;
}

export class CreateChatChannelAdministratorDto {
  @IsNotEmpty()
  @IsNumber()
  owner_id: number;
}
