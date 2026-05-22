import { Controller, Get, ParseIntPipe , Param, Post, Body , Put, Patch} from '@nestjs/common';
import { CreateUserDto } from './dtos/userDto';
import { UpdateUserDto } from './dtos/userUpdateDto';
import { UserServices } from './userServices';


@Controller('usuarios')
export class UserController {
    constructor(private readonly useSerevices : UserServices ) {}

// Rota para listar todos os usuários 
@Get('/listarUser')
async listarUser(){
    return await this.useSerevices.ListarUser();
    
}

// Rota para listar um usuário por ID
@Get('/listarUserId/:id')
async listarUserPorId(@Param('id', ParseIntPipe) id: number){
    return await this.useSerevices.ListarUserId(id);
}

// Rota para cadastrar um novo usuário
@Post('/cadastrarUser')
async cadastrarUser(@Body() CriarUserDto: CreateUserDto){
    return await this.useSerevices.CadastrarUser(CriarUserDto);
}

// Rota para atualizar um usuário existente
@Put('/atualizarUser/:id')
async atualizarUser(@Param('id', ParseIntPipe) id: number, @Body() atualizarUserDto: UpdateUserDto){
    return await this.useSerevices.AtualizarUser(id, atualizarUserDto);
}

@Patch('/inativarUser/:id')
    async inativarUser( @Param('id', ParseIntPipe) id: number,) {
        return await this.useSerevices.InativarUser(id,);
    }


@Get('/listUserDesativado')
async listUserDesativado(){
    return await this.useSerevices.listUserDesativado();
}


}


