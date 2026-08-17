import { Controller, Get, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { OcorrenciaService } from "./ocorrencia.service"
import { Post, Body } from "@nestjs/common";
import { CreateOcorrenciaDto, OcorrenciaStatus } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";

@Controller('ocorrencias')
export class OcorrenciaController {
    constructor(private readonly ocorrenciaService: OcorrenciaService) { }

    // Rota para listar ocorrências
    @Get('/listarOcorrencia')
    async listarOcorrencia() {
        return await this.ocorrenciaService.listarOcorrencia();
    }

    // Rota para criar ocorrência
    @Post('/criarOcorrencia')
    async criarOcorrencia(
        @Body() dto: CreateOcorrenciaDto
    ) {
        return await this.ocorrenciaService.criarOcorrencia(dto);
    }

    // Rota para editar ocorrência
    @Patch('/editarOcorrencia/:id')
    async editarOcorrencia(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOcorrenciaDto
    ) {
        return await this.ocorrenciaService.editarOcorrencia(id, dto);
    }

    // Rota para encerrar ocorrência
    @Patch('/encerrarOcorrencia/:id')
    async encerrarOcorrencia(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.encerrarOcorrencia(id);
    }

    @Patch('/cancelarOcorrencia/:id')
    async cancelarOcorrencia(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.cancelarOcorrencia(id);
    }

    @Patch('/alterarStatus/:id')
    async alterarStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('novoStatus') novoStatus: OcorrenciaStatus
    ) {
        return this.ocorrenciaService.alterarStatus(
            id,
            novoStatus
        );
    }
}