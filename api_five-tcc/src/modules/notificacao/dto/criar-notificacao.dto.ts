import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, } from 'class-validator';

export enum TipoNotificacao {
  NOVA_OCORRENCIA = 'NOVA_OCORRENCIA',
  ALTERACAO_STATUS = 'ALTERACAO_STATUS',
  ENCERRAMENTO = 'ENCERRAMENTO',
  ALERTA = 'ALERTA',
}

export class CriarNotificacaoDto {
  @IsInt()
  id_user!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  mensagem!: string;

  @IsEnum(TipoNotificacao)
  tipo!: TipoNotificacao;

  @IsOptional()
  @IsInt()
  id_ocorrencia?: number;
}
