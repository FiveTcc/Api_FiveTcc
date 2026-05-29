import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/userModule';
import { DatabaseModule } from './db/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import {AmbienteModule} from './modules/ambientes/ambiente.module'


@Module({
  imports: [UserModule , DatabaseModule ,AuthModule , AmbienteModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}
