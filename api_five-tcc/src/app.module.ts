import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/userModule';
import { DatabaseModule } from './db/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AmbienteModule } from './modules/ambientes/ambiente.module'
import { ComponenteModule } from './modules/componentes/componente.module';
import { ComponenteTipoModule } from './modules/componenteTipo/componenteTipo.module';
import { OcorrenciaModule } from './modules/ocorrencias/ocorrencia.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AtribuicaoTecnicoModule } from './modules/atribuicaoTecnicos/atribuicaoTecnico.module';
import { RelatorioModule } from './modules/relatorios/relatorio.module';
import { NotificacaoModule } from './modules/notificacao/notificacao.module';
import { ChatModule } from './modules/chat/chat.module';


@Module({
  imports: [UserModule, DatabaseModule, AuthModule,
    AmbienteModule, ComponenteModule, ComponenteTipoModule,
    OcorrenciaModule, DashboardModule, AtribuicaoTecnicoModule,
    RelatorioModule, NotificacaoModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
