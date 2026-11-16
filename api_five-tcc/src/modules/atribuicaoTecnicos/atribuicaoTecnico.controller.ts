import { Body, Controller,  Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { AtribuicaoTecnicoService } from './atribuicaoTecnico.service';
import { AtribuirTecnicoDto } from './dtos/atribuirTecnicoDtos';
import { AtualizarAtribuicaoDto } from './dtos/atualizarAtribuicaoDto ';

@Controller('atribuicaoTecnicos')
export class AtribuicaoController {
  constructor(private readonly atribuicaoService: AtribuicaoTecnicoService) {}

  // Vincular técnico
  @Post('ocorrencia/:idOcor/vincularTecnico')
  async vincularTecnico(
    @Param('idOcor', ParseIntPipe) idOcor: number,
    @Body() dto: AtribuirTecnicoDto,
  ) {
    return this.atribuicaoService.vincularTecnico(idOcor, dto);
  }

  @Get('ocorrencia/:idOcor/tecnicos')
  async listarTecnicosDaOcorrencia(
    @Param('idOcor', ParseIntPipe) idOcor: number,
  ) {
    return this.atribuicaoService.listarTecnicoDaOcorrencia(idOcor);
  }

  // Listar ocorrências do técnico
  @Get('tecnico/:idUser/ocorrencias')
  async listarOcorrenciasDoTecnico(
    @Param('idUser', ParseIntPipe) idUser: number,
  ) {
    return this.atribuicaoService.listarOcorrenciaDoTecnico(idUser);
  }

  @Delete('/:idOcorUser/desvincular')
  async desvincularTecnico(
    @Param('idOcorUser', ParseIntPipe) idOcorUser: number,
  ) {
    return this.atribuicaoService.desvincularTecnico(idOcorUser);
  }

  // Listar ocorrências do técnico
  @Get('listarVinculos')
  async listarVinculos() {
    return this.atribuicaoService.listarVinculos();
  }
}
