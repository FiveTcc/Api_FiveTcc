import { IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { OcorrenciaPrioridade } from "./createocorrenciaDto";

export class AlterarOcorrenciaPrioridadeDto {

     @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim().toLowerCase();
        }

        return value;
    })

    @IsEnum(OcorrenciaPrioridade, {
        message: 'Prioridade inválida. Use: baixa, media ou alta',
    })
    prioridade!: OcorrenciaPrioridade;

}