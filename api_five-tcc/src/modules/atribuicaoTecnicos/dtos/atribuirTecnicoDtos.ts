import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TipoAtuacao {
  RESPONSAVEL = 1,
  AUXILIAR = 2,
  SUPERVISOR = 3,
}


export class AtribuirTecnicoDto {

  @IsInt()
  @IsNotEmpty()
  id_user!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;

  @IsOptional()
  @IsEnum(TipoAtuacao)
  tipo_atuacao?: TipoAtuacao;
}