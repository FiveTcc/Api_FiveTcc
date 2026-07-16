import { Controller, Post, Get, Patch, Body, Req, UseGuards , Param} from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import type { Request } from "express";
import { AmbienteService } from "./ambiente.service";
import { AuthTokenGuard } from "../auth/guards/auth-token.guad";


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


    @Get('ListarAmbinete')
    async lisatraAmbientes() {
        return this.AmbienteService.ListarAmbientes();
    }

    @Get('/bloco/:bloco')
    async buscarPorBloco(@Param('bloco') bloco: string) {
        return this.AmbienteService.FiltroPorBloco(bloco);
    }

    @Get('/tipo/:tipo')
    async buscarPorTipo(@Param('tipo') tipoAmb: string) {
        return this.AmbienteService.FiltroTipo(tipoAmb);
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

