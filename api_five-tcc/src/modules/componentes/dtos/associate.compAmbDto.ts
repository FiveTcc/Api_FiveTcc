import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class AssociateCompAmbDto {

    @Type(() => Number)
    @IsInt({
        message: 'O ID do ambiente deve ser um número inteiro'
    })
    @IsNotEmpty({
        message: 'O ID do ambiente é obrigatório'
    })
    id_amb!: number;

}