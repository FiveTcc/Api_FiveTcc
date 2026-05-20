import {Injectable} from '@nestjs/common';
import {CriarUserDto} from './userDto'
import { UserRepositorio } from './userRepositorio';

@Injectable()
export class UserServices {
  constructor(private readonly userRepositorio: UserRepositorio) {}


// Método para listar todos os usuários
  async ListarUser(){
    return await this.userRepositorio.ListarUser();
  }

  // Método para listar um usuário por ID
  async ListarUserId(id: number){
    return await this.userRepositorio.ListarUserId(id);
  }

}



