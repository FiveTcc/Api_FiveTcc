import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { RelatorioService } from './relatorio.service';
import { AuthTokenGuard } from '../auth/guards/auth-token.guad';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilterRelatorioDto } from './dtos/filter.relatorioDto';

@UseGuards(AuthTokenGuard, RolesGuard)
@Roles('admin', 'tecnico')
@Controller('relatorios')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) { }

  // Retorna o relatório em JSON (linhas + resumo + agrupamento).
  // Admin vê todas as ocorrências; técnico só vê as próprias.
  @Get()
  async gerar(@Query() filtro: FilterRelatorioDto, @Req() req: Request) {
    return this.relatorioService.gerar(filtro, req['user']);
  }

  // Exporta o relatório como arquivo (Excel ou PDF), conforme filtro.formato.
  @Get('exportar')
  async exportar(
    @Query() filtro: FilterRelatorioDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { buffer, nomeArquivo, contentType } = await this.relatorioService.exportar(
      filtro,
      req['user'],
    );

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
    });
    res.send(buffer);
  }
}