import { Module } from '@nestjs/common';
import { UserModule } from './modules/usuarios/userModule';
import { DatabaseModule } from './db/database/database.module';

@Module({
  imports: [UserModule , DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
