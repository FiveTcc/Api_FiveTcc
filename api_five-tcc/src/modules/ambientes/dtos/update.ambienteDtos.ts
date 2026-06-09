import { PartialType } from '@nestjs/mapped-types';
import { CreateAmbienteDto } from './create.ambienteDto';

export class UpdateAmbienteDto extends PartialType(CreateAmbienteDto) {}