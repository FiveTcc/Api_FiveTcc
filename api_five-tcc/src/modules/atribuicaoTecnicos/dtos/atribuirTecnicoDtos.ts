import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';


export class AtribuirTecnicoDto {
  @IsInt()
  @IsNotEmpty()
  id_user!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo_atuacao?: string;
}