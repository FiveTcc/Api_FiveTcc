import { Controller, Get, ParseIntPipe, Param, Post, Body, Put, Patch, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/userDto';
import { UpdateUserDto } from './dtos/userUpdateDto';
import { UserServices } from './userServices';
import { AuthTokenGuard } from '../auth/guards/auth-token.guad';


//@UseGuards(AuthTokenGuard) // Aplica o guard de autenticação a todas as rotas deste controlador
@Controller('usuarios')
export class UserController {
    constructor(private readonly useSerevices: UserServices) { }

    // Rota para listar todos os usuários 
    @Get('/listarUser')
    async listarUser() {
        return await this.useSerevices.ListarUser();

    }

    // Rota para listar um usuário por ID
    @Get('/listarUserId/:id')
    async listarUserPorId(@Param('id', ParseIntPipe) id: number) {
        return await this.useSerevices.ListarUserId(id);
    }

    // Rota para cadastrar um novo usuário
    @Post('/cadastrarUser')
    async cadastrarUser(@Body() CriarUserDto: CreateUserDto) {
        return await this.useSerevices.CadastrarUser(CriarUserDto);
    }

    // Rota para atualizar um usuário existente
    @Put('/atualizarUser/:id')
    async atualizarUser(@Param('id', ParseIntPipe) id: number, @Body() atualizarUserDto: UpdateUserDto) {
        return await this.useSerevices.AtualizarUser(id, atualizarUserDto);
    }

    // Rota para Atualizar o status de um usuário existente (inativar/ativar)
    @Patch('/inativarUser/:id')
    async atualizarStatusUser(@Param('id', ParseIntPipe) id: number,) {
        return await this.useSerevices.AtualizarStatusUser(id,);
    }

    // Rota para listar os usuários desativados
    @Get('/listarStatusUser')
    async listarStatusUser() {
        return await this.useSerevices.listarStatusUser();
    }


}


