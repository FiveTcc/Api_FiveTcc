import {
    Controller,
    Post,
    Put,
}from '@nestjs/common';


// Controlador para gerenciamento de usuários
@Controller('usuarios')
export class UserController {


// Rota para cadastro de usuário
@Post('cadastroUsuario')
async cadastroUsuario() {
    return 'Cadastro de usuário';
}

// Rota para edição de usuário
@Put('editartUsuario/:id')
async editartUsuario() {
    return 'Editar usuário';
}

// Rota para inativar usuário
@Put('deletarUsuario/:id')
async InativarUsuario(){
    return 'Inativar usuário';
}

}

