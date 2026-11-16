import { Module } from '@nestjs/common';
import { UserController } from './userController';
import { UserRepositorio } from './userRepositorio';
import { UserServices } from './userServices';
import { BcryptService } from '../auth/hashing/bcrypt.services';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [UserController],
  providers: [UserRepositorio, UserServices, BcryptService],
  exports: [],
})
export class UserModule {}
