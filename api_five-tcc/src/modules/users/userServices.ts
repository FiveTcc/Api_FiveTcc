import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/userDto'
import { UpdateUserDto } from './dtos/userUpdateDto';
import { UserRepositorio } from './userRepositorio';
import { BcryptService } from '../auth/hashing/bcrypt.services';

@Injectable()
export class UserServices {
  constructor(private readonly userRepositorio: UserRepositorio,
    private readonly bcryptService: BcryptService) { }

  // Método para listar todos os usuários
  async ListarUser() {
    return await this.userRepositorio.ListarUser();
  }

  // Método para listar um usuário por ID
  async ListarUserId(id: number) {
    return await this.userRepositorio.ListarUserId(id);
  }

  // Método para cadastrar um novo usuário
  async CadastrarUser(CriarUserDto: CreateUserDto) {

    const hashedPassword = await this.bcryptService.hash(
      CriarUserDto.user_senha);

    CriarUserDto.user_senha = hashedPassword;

    const user = await this.userRepositorio.CadastrarUser(CriarUserDto);
    return {
      message: 'Usuário cadastrado com sucesso',
      user
    }
  }

  // Método para atualizar um usuário existente
  async AtualizarUser(id: number, atualizarUserDto: UpdateUserDto) {

    if (atualizarUserDto?.user_senha) {
      const passwordHash = await this.bcryptService.hash(
        atualizarUserDto.user_senha);

      atualizarUserDto.user_senha = passwordHash;
    }

    return await this.userRepositorio.AtualizarUser(
      id, atualizarUserDto);
  }

  // Método para inativar um usuário existente
  async AtualizarStatusUser(id: number) {
    return await this.userRepositorio.AtualizarStatusUser(id)
  }

  // Método para listar usuários desativados
  async listarStatusUser() {
    return await this.userRepositorio.listarStatusUser();
  }

}



