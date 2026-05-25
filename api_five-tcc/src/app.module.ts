import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/userModule';
import { DatabaseModule } from './db/database/database.module';
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [UserModule , DatabaseModule ,AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
