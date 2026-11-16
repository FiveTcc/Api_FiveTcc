import { IsNotEmpty, IsOptional, IsString, MaxLength, } from 'class-validator';

export class CreateAmbienteDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  amb_nome!: string;

  @IsString({ message: 'O tipo deve ser uma string' })
  @IsNotEmpty({ message: 'O tipo é obrigatório' })
  @MaxLength(50, { message: 'O tipo deve ter no máximo 50 caracteres' })
  amb_tipo!: string;

  @IsString({ message: 'O andar deve ser uma string' })
  @IsNotEmpty({ message: 'O andar é obrigatório' })
  @MaxLength(2, { message: 'O andar deve ter no máximo 2 caracteres' })
  amb_andar!: string;

  @IsString({ message: 'O bloco deve ser uma string' })
  @IsNotEmpty({ message: 'O bloco é obrigatório' })
  @MaxLength(5, { message: 'O bloco deve ter no máximo 5 caracteres' })
  amb_bloco!: string;

  @IsString({ message: 'A observação deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'A observação deve ter no máximo 100 caracteres' })
  amb_obs?: string;
}
