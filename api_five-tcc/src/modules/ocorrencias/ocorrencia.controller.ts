import { Controller, Get, Param, ParseIntPipe, Patch, Query, ParseEnumPipe, BadRequestException, Req, UseGuards } from "@nestjs/common";
import { OcorrenciaService } from "./ocorrencia.service"
import { Post, Body } from "@nestjs/common";
import { CreateOcorrenciaDto, OcorrenciaStatus, OcorrenciaPrioridade } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { AssociateOcorCompDto } from "./dtos/associate.ocorCompDto";
import { AssociateOcorAmbDto } from "./dtos/associate.ocorAmbDto";
import { AdicionarObservacaoDto } from "./dtos/add.ocorrenciaObsDto";
import { AlterarOcorrenciaPrioridadeDto } from "./dtos/alter.ocorPriorDto";
import { CreateObservacaoDto } from "./dtos/create.observacaoDto";
import type { Request } from "express";
import { AuthTokenGuard } from "../auth/guards/auth-token.guad";
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from "../auth/guards/roles.guard";



@UseGuards(AuthTokenGuard, RolesGuard)
@Roles('admin', 'tecnico', 'funcionario')
@Controller('ocorrencias')
export class OcorrenciaController {
    constructor(private readonly ocorrenciaService: OcorrenciaService) { }

    // Rota para listar ocorrências
    @Get('/listarOcorrencia')
    async listarOcorrencia() {
        return await this.ocorrenciaService.listarOcorrencia();
    }

    // Rota para listar ocorrências por ID
    @Get('/listarOcorrenciaId/:id')
    async listarOcorrenciaId(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.listarOcorrenciaId(id);
    }

    // Rota para abrir ocorrência
    @Post('/abrirOcorrencia')
    async abrirOcorrencia(
        @Body() dto: CreateOcorrenciaDto,
        @Req() req: Request,
    ) {
        return await this.ocorrenciaService.abrirOcorrencia(
            dto,
            req['user'].id_user,
        );
    }

    // Rota para editar ocorrência
    @Patch('/editarOcorrencia/:id')
    async editarOcorrencia(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateOcorrenciaDto
    ) {
        return await this.ocorrenciaService.editarOcorrencia(id, updateDto);
    }

    // Rota para encerrar ocorrência
    @Roles('admin', 'tecnico')
    @Patch('/encerrarOcorrencia/:id')
    async encerrarOcorrencia(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.encerrarOcorrencia(id);
    }

    // Rota para cancelar a ocorrência
    @Roles('admin', 'tecnico')
    @Patch('/cancelarOcorrencia/:id')
    async cancelarOcorrencia(
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.ocorrenciaService.cancelarOcorrencia(id);
    }

    // Rota para alterar status da ocorrência(aberta, em andamento, encerrada ou cancelada)
    @Roles('admin', 'tecnico')
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

    // Rota para alterar prioridade da ocorrência(Baixa, Media, Alta)
    @Roles('admin', 'tecnico')
    @Patch('/alterarPrioridade/:id')
    async alterarPrioridade(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AlterarOcorrenciaPrioridadeDto
    ) {
        return this.ocorrenciaService.alterarPrioridade(id, dto.prioridade);
    }

    // Rota para alterar observação da ocorrência
    @Patch(':id/adicionarObservacao')
    async adicionarObservacao(
        @Param('id', ParseIntPipe) id: number,
        @Body() obsDto: AdicionarObservacaoDto
    ) {
        return await this.ocorrenciaService.adicionarObservação(id, obsDto.ocor_obs)
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

    // ##### Rotas de Filtros #####
    @Get('buscarPorAmbiente')
    async filtrarPorAmbiente(
        @Query('nomeAmb') nomeAmb: string
    ) {
        return await this.ocorrenciaService.filtrarPorAmbiente(nomeAmb);
    }

    @Get('buscarPorComponente')
    async filtrarPorComponente(
        @Query('nomeComp') nomeComp: string
    ) {
        return await this.ocorrenciaService.filtrarPorComponente(nomeComp);
    }

    @Get('buscarPorNome')
    async filtrarPorNome(
        @Query('nomeOcor') nomeOcor: string
    ) {
        return await this.ocorrenciaService.filtrarPorNome(nomeOcor);
    }

    @Get('buscarPorStatus')
    async filtrarPorStatus(
        @Query('status', new ParseEnumPipe(OcorrenciaStatus, {
            exceptionFactory: () =>
                new BadRequestException(
                    'Status inválido'
                ),
        }))
        status: OcorrenciaStatus,
    ) {
        return await this.ocorrenciaService.filtrarPorStatus(status);
    }


    @Get('buscarPorPrioridade')
    async filtrarPorPrioridade(
        @Query('prioridade', new ParseEnumPipe(OcorrenciaPrioridade, {
            exceptionFactory: () =>
                new BadRequestException(
                    'Prioridade inválida'
                ),
        }))
        prioridade: OcorrenciaPrioridade,
    ) {
        return await this.ocorrenciaService.filtrarPorPrioridade(prioridade);
    }

    @Get('buscarPorPeriodo')
    async filtrarPorPeriodo(
        @Query('dataInicio') dataInicio: string,
        @Query('dataFim') dataFim: string,
    ) {
        return await this.ocorrenciaService.filtrarPorPeriodo(dataInicio, dataFim);
    }

    @Post(':id/observacoes')
    async criarObservacao(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateObservacaoDto,
        @Req() req: Request,
    ) {
        const usuario = req['user'] as { id_user: number };

        return await this.ocorrenciaService.criarObservacao(
            id,
            usuario.id_user,
            dto,
        );
    }

    @Get(':id/observacoes')
    async listarObservacoes(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.ocorrenciaService.listarObservacoes(id);
    }
}