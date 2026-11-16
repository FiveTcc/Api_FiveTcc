import { Module } from '@nestjs/common';
import { OcorrenciaController } from './ocorrencia.controller';
import { OcorrenciaService } from './ocorrencia.service';
import { OcorrenciaRepository } from './ocorrencia.repository';
import { ComponenteModule } from '../componentes/componente.module';
import { AmbienteModule } from '../ambientes/ambiente.module';
import { NotificacaoModule } from '../notificacao/notificacao.module';

@Module({
  controllers: [OcorrenciaController],
  providers: [OcorrenciaService, OcorrenciaRepository],
  imports: [ComponenteModule, AmbienteModule, NotificacaoModule],
  exports: [OcorrenciaService],
})
export class OcorrenciaModule {}
