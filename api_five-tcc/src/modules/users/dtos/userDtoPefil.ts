import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  user_nome?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  user_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  user_telefone?: string;
}