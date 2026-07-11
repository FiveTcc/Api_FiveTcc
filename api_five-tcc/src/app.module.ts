import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/userModule';
import { DatabaseModule } from './db/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import {AmbienteModule} from './modules/ambientes/ambiente.module'
import { ComponenteModule } from './modules/componentes/componente.module';
import { ComponenteTipoModule } from './modules/componenteTipo/componenteTipo.module';


@Module({
  imports: [UserModule , DatabaseModule ,AuthModule , AmbienteModule, ComponenteModule, ComponenteTipoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
