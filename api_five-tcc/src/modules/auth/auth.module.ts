import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.services';
import { AuthController } from './auth.controller';
import { AuthServices } from './auth.services';
import { UserRepositorio } from '../users/userRepositorio';

@Global()
@Module({

    controllers: [AuthController],
    providers: [ 
        AuthServices,
        UserRepositorio,
        {
            provide: HashingService,
            useClass: BcryptService
        }
    ],
    exports: [HashingService]

})
export class AuthModule { }