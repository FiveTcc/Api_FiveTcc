import { Controller, Get, ParseIntPipe , Param, Post, Body , Put} from '@nestjs/common';
import { CreateUserDto  } from './userDto';
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

@Post('/cadastrarUser')
async cadastrarUser(@Body() CriarUserDto: CreateUserDto){
    return await this.useSerevices.CadastrarUser(CriarUserDto);
}

@Put('/atualizarUser/:id')
async atualizarUser(@Param('id', ParseIntPipe) id: number, @Body() userData: CreateUserDto){
    return `Atualizar usuário por ID: ${id}`;
}



 
}


