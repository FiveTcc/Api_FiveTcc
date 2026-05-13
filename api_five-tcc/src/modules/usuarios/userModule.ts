import {Module} from '@nestjs/common';
import {UserController} from './userController';

@Module({
    controllers: [UserController],
    providers: [],
    exports: [],

})
export class UserModule {}