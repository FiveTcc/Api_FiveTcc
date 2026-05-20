import {Module} from '@nestjs/common';
import {UserController} from './userController';
import {UserRepositorio} from './userRepositorio';
import {UserServices} from './userServices';


@Module({
    controllers: [UserController ],
    providers: [UserRepositorio , UserServices],
    exports: [],

})
export class UserModule {}