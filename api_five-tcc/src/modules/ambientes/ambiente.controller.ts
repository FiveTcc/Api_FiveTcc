import { Controller, Post, Get, Patch, Body, Req, UseGuards } from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import type { Request } from "express";
import { AmbienteService } from "./ambiente.service";
import { AuthTokenGuard } from "../auth/guards/auth-token.guad";


@Controller('ambientes')
export class AmbientesController {
    constructor(private readonly AmbienteService: AmbienteService) { }


    @UseGuards(AuthTokenGuard)
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

    @Get('ListarAmbinete')
    async lisatraAmbientes() {
        return this.AmbienteService.ListarAmbientes();
    }

    @Get('/bloco/:bloco')
    async buscarPorBloco() {
        return 'bloco encontrado'
    }

    @Get('/tipo/:tipo')
    async buscarPorTipo() {
        return 'tipo encontrado'
    }

    @Patch(':id')
    async atualizar() {
        return 'atualizado'
    }

    @Patch(':id/status')
    async alterarStatus() {
        return 'atualizado ?'
    }

    @Patch(':id')
    async inativarAmbiente() {
        return 'ambiente inativado'
    }


}

