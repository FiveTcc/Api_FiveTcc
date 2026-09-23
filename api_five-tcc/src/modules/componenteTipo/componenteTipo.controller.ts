import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ComponenteTipoService } from "./componenteTipo.service";
import { UpdateComponenteTipoDto } from "./dtos/update.componenteTipoDto";
import { CreateComponenteTipoDto } from "./dtos/create.componenteTipoDto";
import { AuthTokenGuard } from '../auth/guards/auth-token.guad';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthTokenGuard, RolesGuard) // Aplica o guard de autenticação a todas as rotas deste controlador 
@Roles('admin', 'tecnico', 'funcionario') // Aplica o decorator de roles a todas as rotas deste controlador, permitindo apenas usuários com a role 'admin'
@Controller('componentes-tipo')
export class ComponenteTipoController {
    constructor(private readonly componenteTipoService: ComponenteTipoService) { }

    // Rota para listar tipos de componentes
    @Get('/listarComponenteTipo')
    async listarComponenteTipo() {
        return await this.componenteTipoService.listarComponenteTipo();
    }

    // Rota para listar tipos de componentes por ID
    @Get('/listarComponenteTipoId/:id')
    async listarComponenteTipoPorId(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.componenteTipoService.listarComponenteTipoId(id);
    }

    // Rota para cadastrar tipo de componente
    @Post('/cadastrarComponenteTipo')
    async cadastrarComponenteTipo(
        @Body() CreateComponenteTipoDto : CreateComponenteTipoDto
    ) {
        return await this.componenteTipoService.cadastrarComponenteTipo(CreateComponenteTipoDto);
    }

    // Rota para atualizar tipo de componente
    @Patch('/atualizarComponenteTipo/:id')
    async atualizarComponenteTipo(
        @Param('id', ParseIntPipe) id: number,
        @Body() UpdateComponenteTipoDto: UpdateComponenteTipoDto
    ) {
        return await this.componenteTipoService.atualizarComponenteTipo(id, UpdateComponenteTipoDto);
    }

    // Rota para excluir tipo de componente
    @Delete('/excluirComponenteTipo/:id')
    async excluirComponenteTipo(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.componenteTipoService.excluirComponenteTipo(id);
    }
}