import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssociateOcorCompDto {
  @Type(() => Number)
  @IsInt({ message: 'O ID do componente deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O ID do componente é obrigatório' })
  id_comp!: number;
}
