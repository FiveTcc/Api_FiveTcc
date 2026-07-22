import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.services';
import { AuthController } from './auth.controller';
import { AuthServices } from './auth.services';
import { UserRepositorio } from '../users/userRepositorio';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';


@Global()
@Module({

    imports:[
         ConfigModule.forRoot({
      isGlobal: true,
   }),
       ConfigModule.forFeature(jwtConfig),
       JwtModule.registerAsync(jwtConfig.asProvider())
    ],
    controllers: [AuthController],
    providers: [ 
        AuthServices,
        UserRepositorio,
        {
            provide: HashingService,
            useClass: BcryptService
        }
    ],
    exports: [HashingService , JwtModule , ConfigModule , ] 

})
export class AuthModule { }