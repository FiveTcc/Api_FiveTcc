import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateObservacaoDto {
  @IsString({ message: 'A observação deve ser uma string' })
  @IsNotEmpty({ message: 'A observação é obrigatória' })
  @MaxLength(5000, {
    message: 'A observação deve ter no máximo 5000 caracteres',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  })
  obs_texto!: string;
}
