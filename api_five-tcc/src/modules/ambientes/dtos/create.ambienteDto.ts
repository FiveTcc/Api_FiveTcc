import  {  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength, } from 'class-validator';


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
  @MaxLength(50)
  amb_andar!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  amb_bloco!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  amb_obs?: string;

  @IsBoolean()
  @IsOptional()
  amb_ativo?: boolean = true;



}
