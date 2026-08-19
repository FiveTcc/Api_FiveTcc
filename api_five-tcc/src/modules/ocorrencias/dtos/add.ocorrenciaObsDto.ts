import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class AdicionarObservacaoDto {

    @IsString({
        message: 'A observação deve ser uma string'
    })
    @IsNotEmpty({
        message: 'A observação é obrigatória'
    })
    @MaxLength(255, {
        message: 'A observação deve ter no máximo 255 caracteres'
    })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }

        return value;
    })
    ocor_obs!: string;
}