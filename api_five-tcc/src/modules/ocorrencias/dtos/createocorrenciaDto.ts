import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsOptional, IsInt } from "class-validator";

// Status da ocorrencia (aberto, Em andamento, encerrado, cancelado)
export enum OcorrenciaStatus {
    ABERTA = 'aberta',
    EM_ANDAMENTO = 'em andamento',
    CONCLUIDA = 'concluida',
    CANCELADA = 'cancelada',
}

// Prioridade da ocorrência (baixa, média, alta)
export enum OcorrenciaPrioridade {
    BAIXA = 'baixa',
    MEDIA = 'media',
    ALTA = 'alta',
    CRITICA = 'critica'
}

export class CreateOcorrenciaDto {
    @IsString({ message: "O nome deve ser uma string" })
    @IsNotEmpty({ message: "O nome é obrigatório" })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    ocor_nome!: string;

    @IsEnum(OcorrenciaPrioridade, { message: 'Prioridade inválida', })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    ocor_prioridade!: OcorrenciaPrioridade;

    @IsOptional()
    @IsString({ message: 'A observação deve ser uma string' })
    @MaxLength(255, { message: 'A observação deve ter no máximo 255 caracteres' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    ocor_obs?: string;

    @Type(() => Number)
    @IsInt({ message: 'O ID de componente deve ser um número inteiro' })
    @IsNotEmpty({ message: 'O ID de componente é obrigatório' })
    componente_id!: number;

    @Type(() => Number)
    @IsInt({ message: 'O ID de ambiente deve ser um número inteiro' })
    @IsNotEmpty({ message: 'O ID de ambiente é obrigatório' })
    ambiente_id!: number;

}