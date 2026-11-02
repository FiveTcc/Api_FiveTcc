import { Injectable } from '@nestjs/common';
import { RelatorioRepository } from './relatorio.repository';
import { FilterRelatorioDto } from './dtos/filter.relatorioDto';
import { UserTipo } from '../common/enums/userTipo.enum';
import { ExcelExporter } from './exporters/excel.exporter';
import { PdfExporter, RankingItem } from './exporters/pdf.exporter';

type Linhas = Awaited<ReturnType<RelatorioRepository['buscarOcorrencias']>>;

@Injectable()
export class RelatorioService {
  constructor(
    private readonly repository: RelatorioRepository,
    private readonly excelExporter: ExcelExporter,
    private readonly pdfExporter: PdfExporter,
  ) { }

  // Monta o relatório (linhas + resumo + agrupamento + opções dos filtros).
  async gerar(filtroOriginal: FilterRelatorioDto, user: any) {
    const filtro = this.aplicarRestricaoTecnico(filtroOriginal, user);

    // Técnico não pode agrupar por técnico.
    const agruparBloqueado =
      user.role === UserTipo.TECNICO &&
      filtro.agruparPor === 'tecnico';

    const [linhas, opcoesFiltros] = await Promise.all([
      this.repository.buscarOcorrencias(filtro),
      this.repository.listarOpcoesFiltros(),
    ]);

    const resumo = this.calcularResumo(linhas);

    const agrupamento =
      filtro.agruparPor && !agruparBloqueado
        ? await this.buscarAgrupamento(filtro)
        : undefined;

    // Técnico só recebe a própria opção no filtro de técnicos.
    const opcoesVisiveis =
      user.role === UserTipo.TECNICO
        ? {
          ...opcoesFiltros,
          tecnicos: opcoesFiltros.tecnicos.filter(
            (tecnico) => Number(tecnico.id) === Number(user.id_user),
          ),
        }
        : opcoesFiltros;

    return {
      filtros: filtro,
      resumo,
      agrupamento,
      opcoesFiltros: opcoesVisiveis,
      linhas,
    };
  }

  async exportar(filtroOriginal: FilterRelatorioDto, user: any) {
    const dados = await this.gerar(filtroOriginal, user);

    // Um único objeto para os dois formatos: PDF e Excel mostram os mesmos dados.
    const relatorio = await this.montarRelatorio(dados, user);

    if (filtroOriginal.formato === 'xlsx') {
      // O agrupamento é o único extra do Excel (aba opcional)
      return this.excelExporter.gerar({ ...relatorio, agrupamento: dados.agrupamento });
    }

    return this.pdfExporter.gerar(relatorio);
  }

  // Objeto usado pelos dois exporters: quem gerou, filtros legíveis,
  // resumo, rankings e linhas. O ranking de técnicos só existe para admin.
  private async montarRelatorio(
    dados: Awaited<ReturnType<RelatorioService['gerar']>>,
    user: any,
  ) {
    const ehAdmin = user.role === UserTipo.ADMINISTRADOR;
    const f = dados.filtros;

    const [usuario, nomes, ambientes, componentes, tecnicos, prioridades] =
      await Promise.all([
        this.repository.buscarUsuarioPorId(user.id_user),
        this.repository.buscarNomesFiltros(f),
        this.repository.contarPorAmbiente(f),
        this.repository.contarPorComponente(f),
        ehAdmin ? this.repository.contarPorTecnico(f) : Promise.resolve(undefined),
        this.repository.contarPorPrioridade(f),
      ]);

    return {
      geradoPor: { nome: usuario?.user_nome ?? 'Usuário', perfil: user.role },
      filtros: {
        inicio: f.data_inicial,
        fim: f.data_final,
        ambiente: nomes.ambiente,
        tecnico: nomes.tecnico,
        status: f.status,
        prioridade: f.prioridade,
      },
      resumo: dados.resumo,
      porPrioridade: Object.fromEntries(
        prioridades.map((p) => [p.prioridade, Number(p.total)]),
      ),
      rankings: {
        ambientes: this.paraRanking(
          ambientes.map((a) => ({ nome: a.ambiente ?? '-', total: a.total })),
        ),
        componentes: this.paraRanking(
          componentes.map((c) => ({ nome: c.componente, total: c.total })),
        ),
        tecnicos: tecnicos
          ? this.paraRanking(
            tecnicos.map((t) => ({ nome: t.tecnico ?? '-', total: t.total })),
          )
          : undefined,
      },
      linhas: dados.linhas.map((l) => ({
        id: l.id,
        titulo: l.nome,
        status: l.status,
        prioridade: l.prioridade,
        ambiente: l.ambiente,
        componente: l.componente,
        criadoPor: l.criado_por,
        tecnicos: l.tecnico_responsavel,
        criadoEm: l.criado_em,
        encerradoEm: l.encerrado_em,
      })),
    };
  }

  // Ordena do maior para o menor e converte o total (o MySQL pode devolver count como string)
  private paraRanking(
    itens: { nome: string; total: number | string }[],
  ): RankingItem[] {
    return itens
      .map((i) => ({ nome: i.nome, total: Number(i.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  // Técnico só enxerga as próprias ocorrências. Retorna uma cópia do filtro.
  private aplicarRestricaoTecnico(
    filtro: FilterRelatorioDto,
    user: any,
  ): FilterRelatorioDto {
    if (user.role === UserTipo.TECNICO) {
      return { ...filtro, tecnico: user.id_user };
    }
    return { ...filtro };
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

  private calcularResumo(linhas: Linhas) {
    const total = linhas.length;
    const abertas = linhas.filter((o) => o.status === 'aberta').length;
    const emAndamento = linhas.filter((o) => o.status === 'em andamento').length;
    const concluidas = linhas.filter((o) => o.status === 'concluida').length;
    const canceladas = linhas.filter((o) => o.status === 'cancelada').length;

    // só concluídas entram no tempo médio de atendimento
    const atendidas = linhas.filter(
      (o): o is typeof o & { encerrado_em: Date } =>
        o.status === 'concluida' && o.encerrado_em !== null,
    );

    const tempoMedioHoras = atendidas.length
      ? Number(
        (
          atendidas.reduce(
            (soma, o) =>
              soma + (o.encerrado_em.getTime() - o.criado_em.getTime()) / 3_600_000,
            0,
          ) / atendidas.length
        ).toFixed(1),
      )
      : null;

    return { total, abertas, emAndamento, concluidas, canceladas, tempoMedioHoras };
  }
}