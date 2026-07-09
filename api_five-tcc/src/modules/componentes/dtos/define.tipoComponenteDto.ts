import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class DefineTipoComponenteDto {

    @Type(() => Number)
    @IsInt({
        message: 'O tipo de componente deve ser um número inteiro'
    })
    @IsNotEmpty({
        message: 'O tipo de componente é obrigatório'
    })
    compo_tipo_id!: number;

}