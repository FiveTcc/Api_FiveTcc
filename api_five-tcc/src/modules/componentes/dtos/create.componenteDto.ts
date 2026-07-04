import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateComponenteDto {
    @IsString({ message: 'O nome deve ser uma string' })
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    compo_nome!: string;

    @IsString({ message: 'A observação deve ser uma string' })
    @IsOptional()
    @MaxLength(150, { message: 'A observação deve ter no máximo 150 caracteres' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    compo_obs?: string;

    @IsBoolean({ message: 'O campo deve ser verdadeiro ou falso' })
    @IsOptional()
    compo_ativo?: boolean;

    @Type(() => Number)
    @IsInt({ message: 'O tipo de componente deve ser um número inteiro' })
    @IsNotEmpty({ message: 'O tipo de componente é obrigatório'})
    compo_tipo_id!: number;

    @Type(() => Number)
    @IsInt({message: 'O ID de ambiente deve ser um número inteiro'})
    id_amb!: number;
}