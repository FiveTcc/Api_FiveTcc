import { Controller, Post, Get, Patch, Body, Req, UseGuards , Param, Put , ParseIntPipe, Query} from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import type { Request } from "express";
import { AmbienteService } from "./ambiente.service";
import { AuthTokenGuard } from "../auth/guards/auth-token.guad";
import { UpdateAmbienteDto } from "./dtos/update.ambienteDtos";


@UseGuards(AuthTokenGuard)
@Controller('ambientes')
export class AmbientesController {
    constructor(private readonly AmbienteService: AmbienteService) { }


    @Post('cadastrarAmbiente')
    Cadastrar(
        @Body() CreateAmbienteDto: CreateAmbienteDto,
        @Req() req: Request,
    ) {
        return this.AmbienteService.CadastrarAmbiente(
            CreateAmbienteDto,
            req['user'].id_user,
        );
    }


    // Rota para listar todos os ambientes
    @Get('ListarAmbinete')
    async lisatraAmbientes() {
        return this.AmbienteService.ListarAmbientes();
    }

    // Rota para buscar ambientes por bloco
    @Get('buscarPorBloco')
    async buscarPorBloco(@Query('bloco') bloco: string) {
        return this.AmbienteService.FiltroPorBloco(bloco);
    }
    
    // Rota para buscar ambientes por tipo
    @Get('buscarPorTipo')
    async buscarPorTipo(@Query('tipo') tipoAmb: string) {
        return this.AmbienteService.FiltroTipo(tipoAmb);
    }
    
    // Rota para editar um ambiente existente
    @Put('/editarAmbiente/:id')
    async EditarAmbiente(@Param('id', ParseIntPipe) id: number, @Body() UpdateAmbienteDto: UpdateAmbienteDto) {
        return this.AmbienteService.EditarAmbiente(id , UpdateAmbienteDto);
    }

    // Rota para Atualizar o status de um usuário existente (inativar/ativar)
    @Patch('/AtualizarStatusAmbiente/:id')
    async atualizarStatusUser(@Param('id', ParseIntPipe) id: number,) {
        return await this.AmbienteService.AtualizarStatusAmbiente(id);
    }


}

