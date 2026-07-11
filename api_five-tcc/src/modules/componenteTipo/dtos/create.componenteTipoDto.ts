import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateComponenteTipoDto {
    @IsNotEmpty({ message: 'Tipo de componente é obrigatório'})
    @IsString({ message: 'O tipo de componente deve ser uma string' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    compo_tipo!: string;
}