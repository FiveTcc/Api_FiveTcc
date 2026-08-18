import { Controller, Get, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { OcorrenciaService } from "./ocorrencia.service"
import { Post, Body } from "@nestjs/common";
import { CreateOcorrenciaDto, OcorrenciaStatus } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { AssociateOcorCompDto } from "./dtos/associate.ocorCompDto";
import { AssociateOcorAmbDto } from "./dtos/associate.ocorAmbDto";

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

    // Rota para cancelar a ocorrência
    @Patch('/cancelarOcorrencia/:id')
    async cancelarOcorrencia(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.cancelarOcorrencia(id);
    }

    // Rota para alterar status da ocorrência(aberta, em andamento, encerrada ou cancelada)
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

    // Rota para associar componente a ocorrência
    @Patch(':id/associarComponente')
    async associarComponente(
        @Param('id', ParseIntPipe) id: number,
        @Body() associateOcorCompDto: AssociateOcorCompDto
    ) {
        return await this.ocorrenciaService.associarComponente(id, associateOcorCompDto.id_comp)
    }

    // Rota para associar ambiente a ocorrência
     @Patch(':id/associarAmbiente')
    async associarAmbiente(
        @Param('id', ParseIntPipe) id: number,
        @Body() associateOcorAmbDto: AssociateOcorAmbDto
    ) {
        return await this.ocorrenciaService.associarAmbiente(id, associateOcorAmbDto.id_amb)
    }
}