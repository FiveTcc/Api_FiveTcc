import { PartialType } from '@nestjs/mapped-types';
import { AtribuirTecnicoDto } from './atribuirTecnicoDtos';

export class AtualizarAtribuicaoDto extends PartialType(AtribuirTecnicoDto) {}
