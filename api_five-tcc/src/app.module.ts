import { Module } from '@nestjs/common';
import { UserModule } from './modules/usuarios/userModule';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
