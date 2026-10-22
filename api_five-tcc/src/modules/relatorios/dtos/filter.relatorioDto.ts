import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

export class FilterRelatorioDto {
  @IsOptional()
  @IsDateString({}, { message: 'data_inicial deve estar no formato ISO (YYYY-MM-DD)' })
  data_inicial?: string;

  @IsOptional()
  @IsDateString({}, { message: 'data_final deve estar no formato ISO (YYYY-MM-DD)' })
  data_final?: string;

  @IsOptional()
  @IsIn(['aberta', 'em andamento', 'concluida', 'cancelada'], { message: 'Status inválido. Os valores permitidos são: aberta, em andamento, concluida, cancelada' })
  status?: string;

  @IsOptional()
  @IsIn(['baixa', 'media', 'alta', 'critica'], { message: 'Prioridade inválida. Os valores permitidos são: baixa, media, alta, critica' })
  prioridade?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ambiente deve ser um número' })
  ambiente?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Técnico deve ser um número' })
  tecnico?: number;

  @IsOptional()
  @IsIn(['data', 'status', 'prioridade', 'ambiente', 'tecnico'], { message: 'Agrupamento inválido. Os valores permitidos são: data, status, prioridade, ambiente, tecnico' })
  agruparPor?: string;

  @IsOptional()
  @IsIn(['json', 'pdf', 'xlsx'], { message: 'Formato inválido. Os valores permitidos são: json, pdf, xlsx' })
  formato?: string = 'json';
}