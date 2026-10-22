import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TipoAtuacao {
  RESPONSAVEL = 1,
  AUXILIAR = 2,
  SUPERVISOR = 3,
}


export class AtribuirTecnicoDto {
  @IsInt({ message: 'O ID deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O ID é obrigatório' })
  id_user!: number;

  @IsOptional()
  @IsString({ message: 'A observação deve ser uma string' })
  @MaxLength(150, { message: 'A observação deve ter no máximo 150 caracteres' })
  observacoes?: string;

  @IsOptional()
  @IsEnum(TipoAtuacao)
  tipo_atuacao?: TipoAtuacao;
}