import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString({ message: 'O usuário deve ser uma string' })
  @MaxLength(100, { message: 'O usuário deve ter no máximo 100 caracteres' })
  user_nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido', })
  @MaxLength(255, { message: 'O email deve ter no máximo 20 caracteres' })
  user_email?: string;

  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string' })
  @MaxLength(20, { message: 'O telefone deve ter no máximo 20 caracteres' })
  user_telefone?: string;
}