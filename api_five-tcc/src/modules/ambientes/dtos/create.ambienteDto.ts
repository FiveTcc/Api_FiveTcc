import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAmbienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  amb_nome!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  amb_tipo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  amb_andar!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  amb_bloco!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  amb_obs?: string;
}