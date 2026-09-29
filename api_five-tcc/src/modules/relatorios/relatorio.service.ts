import { Injectable } from '@nestjs/common';
import { RelatorioRepository } from './relatorio.repository';
import { FilterRelatorioDto } from './dtos/filter.relatorioDto';
import { UserTipo } from '../common/enums/userTipo.enum';
import { ExcelExporter } from './exporters/excel.exporter';
import { PdfExporter } from './exporters/pdf.exporter';

@Injectable()
export class RelatorioService {
  constructor(
    private readonly repository: RelatorioRepository,
    private readonly excelExporter: ExcelExporter,
    private readonly pdfExporter: PdfExporter,
  ) { }

  // Monta o relatório (linhas + resumo + agrupamento, se pedido).
  // Aplica a restrição do técnico antes de qualquer consulta.
  async gerar(filtro: FilterRelatorioDto, user: any) {
    this.aplicarRestricaoTecnico(filtro, user);

    const linhas = await this.repository.buscarOcorrencias(filtro);
    const resumo = this.calcularResumo(linhas);
    const agrupamento = filtro.agruparPor
      ? await this.buscarAgrupamento(filtro)
      : undefined;

    return { filtros: filtro, resumo, agrupamento, linhas };
  }

  // Gera o arquivo (Excel ou PDF) a partir dos mesmos dados do gerar().
  async exportar(filtro: FilterRelatorioDto, user: any) {
    const dados = await this.gerar(filtro, user);

    if (filtro.formato === 'xlsx') {
      return this.excelExporter.gerar(dados);
    }
    return this.pdfExporter.gerar(dados);
  }

  // Técnico só enxerga as próprias ocorrências atribuídas, mesmo que
  // tente passar outro valor em "tecnico" na query.
  private aplicarRestricaoTecnico(filtro: FilterRelatorioDto, user: any) {
    if (user.role === UserTipo.TECNICO) {
      filtro.tecnico = user.id_user;
    }
  }

  private async buscarAgrupamento(filtro: FilterRelatorioDto) {
    switch (filtro.agruparPor) {
      case 'tecnico':
        return this.repository.contarPorTecnico(filtro);
      case 'ambiente':
        return this.repository.contarPorAmbiente(filtro);
      case 'status':
        return this.repository.contarPorStatus(filtro);
      case 'prioridade':
        return this.repository.contarPorPrioridade(filtro);
      case 'data':
        return this.repository.contarPorData(filtro);
      default:
        return undefined;
    }
  }

  // Resumo calculado em cima das linhas já filtradas, sem nova consulta.
  private calcularResumo(linhas: Awaited<ReturnType<RelatorioRepository['buscarOcorrencias']>>) {
    const total = linhas.length;
    const abertas = linhas.filter((o) => o.status === 'aberta').length;
    const emAndamento = linhas.filter((o) => o.status === 'em andamento').length;
    const concluidas = linhas.filter((o) => o.status === 'concluida').length;
    const canceladas = linhas.filter((o) => o.status === 'cancelada').length;

    const encerradas = linhas.filter(
      (o): o is typeof o & { encerrado_em: Date } => o.encerrado_em !== null,
    );

    const tempoMedioHoras = encerradas.length
      ? encerradas.reduce((soma, o) => {
        const horas = (o.encerrado_em.getTime() - o.criado_em.getTime()) / (1000 * 60 * 60);
        return soma + horas;
      }, 0) / encerradas.length
      : 0;

    return {
      total,
      abertas,
      concluidas,
      emAndamento,
      canceladas,
      tempoMedioHoras: Number(tempoMedioHoras.toFixed(1)),
    };
  }
}