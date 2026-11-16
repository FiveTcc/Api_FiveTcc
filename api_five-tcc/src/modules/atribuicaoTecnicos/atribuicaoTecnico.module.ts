import { Module } from '@nestjs/common';

import { AtribuicaoTecnicoService } from './atribuicaoTecnico.service';
import { AtribuicaoTecnicoRepository } from './atribuicaoTecnico.repository';
import { OcorrenciaModule } from '../ocorrencias/ocorrencia.module';
import { AtribuicaoController } from './atribuicaoTecnico.controller';

@Module({
  controllers: [AtribuicaoController],
  providers: [AtribuicaoTecnicoService, AtribuicaoTecnicoRepository],
  imports: [OcorrenciaModule],
})
export class AtribuicaoTecnicoModule {}
