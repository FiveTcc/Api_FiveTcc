import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { ComponenteService } from "./componente.service";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";
import { AssociateCompAmbDto } from "./dtos/associate.compAmbDto";
import { DefineTipoComponenteDto } from "./dtos/define.tipoComponenteDto";

@Controller('componentes')
export class ComponenteController {
    constructor(private readonly componenteService: ComponenteService) { }

    // Rota para listar componentes
    @Get('/listarComponente')
    async listarComponente() {
        return await this.componenteService.listarComponente();
    }

    // Rota para listar componentes por id
    @Get('/listarComponenteId/:id')
    async listarComponentePorId(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.componenteService.listarComponenteId(id);
    }

    // Rota para cadastrar componente 
    @Post('/cadastrarComponente')
    async cadastrarComponente(
        @Body() CreateComponenteDto: CreateComponenteDto
    ) {
        return await this.componenteService.cadastrarComponente(CreateComponenteDto);
    }

    // Rota para atualizar componentes
    @Patch('/atualizarComponente/:id')
    async atualizarComponente(
        @Param('id', ParseIntPipe) id: number,
        @Body() UpdateComponenteDto: UpdateComponenteDto
    ) {
        return await this.componenteService.atualizarComponente(id, UpdateComponenteDto);
    }

    // Rota para excluir componente
    @Delete('/excluirComponente/:id')
    async excluirComponente(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.componenteService.excluirComponente(id);
    }

    // Rota para atualizar o status do componente
    @Patch('/atualizarStatusComponente/:id')
    async atualizarStatusComponente(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.componenteService.atualizarStatusComponente(id);
    }

    // Rota para associar componente a ambiente
    @Patch(':id/associarComponenteAmbiente')
    async associarCompAmb(
        @Param('id', ParseIntPipe) id: number,
        @Body() AssociateCompAmbDto: AssociateCompAmbDto
    ) {
        return await this.componenteService.associarCompAmb(id, AssociateCompAmbDto.id_amb);
    }

    // Rota para alterar tipo do componente
    @Patch(':id/alterarTipoComponente')
    async alterarTipoComponente(
        @Param('id', ParseIntPipe) id: number,
        @Body() DefineTipoComponenteDto: DefineTipoComponenteDto
    ) {
        return await this.componenteService.alterarTipoComponente(id, DefineTipoComponenteDto.compo_tipo_id)
    }

    // ##### Rotas de Filtros #####

    // Rota para busca por ambiente
    @Get('buscarPorAmbiente')
    async filtrarPorAmbiente(
        @Query('nomeAmb') nomeAmb: string
    ) {
        return await this.componenteService.filtrarPorAmbiente(nomeAmb);
    }

    // Rota para busca por tipo de componente
    @Get('buscarPorTipo')
    async filtrarPorTipo(
        @Query('tipo') tipo: string
    ) {
        return await this.componenteService.filtrarPorTipo(tipo);
    }

    // Rota para buscar componente po nome
    @Get('buscarPorNome/:nome')
    async filtrarPorNome(
        @Param('nome') nome: string
    ) {
        return await this.componenteService.filtrarPorNome(nome)
    }

}