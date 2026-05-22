import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dtos/userDto'
import { UpdateUserDto } from './dtos/userUpdateDto';
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

  // Método para cadastrar um novo usuário
  async CadastrarUser(CriarUserDto: CreateUserDto){
    return await this.userRepositorio.CadastrarUser(CriarUserDto),'Usuario cadastrado com sucesso';
  }

  // Método para atualizar um usuário existente
  async AtualizarUser(id: number, atualizarUserDto: UpdateUserDto){
    return await this.userRepositorio.AtualizarUser(id, atualizarUserDto),'Usuario atualizado com sucesso';
  }
 
  // Método para inativar um usuário existente
  async InativarUser(id: number){
    return await this.userRepositorio.InativarUser(id),'Usuario inativado com sucesso';
  }

  async listUserDesativado(){
    return await this.userRepositorio.listUserDesativado();
  }

}



