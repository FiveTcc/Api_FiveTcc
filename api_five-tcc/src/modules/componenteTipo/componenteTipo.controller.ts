import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ComponenteTipoService } from "./componenteTipo.service";
import { UpdateComponenteTipoDto } from "./dtos/update.componenteTipoDto";
import { CreateComponenteTipoDto } from "./dtos/create.componenteTipoDto";

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