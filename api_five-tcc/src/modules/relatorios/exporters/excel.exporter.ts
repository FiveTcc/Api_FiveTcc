import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import type { RankingItem, RelatorioDados } from './pdf.exporter';

const logoBuffer = fs.readFileSync(
  path.join(process.cwd(), 'src/assets/logo_sem_fundo.png'),
);

const COR = {
  primaria: 'FF0B2E8A',
  branco: 'FFFFFFFF',
  borda: 'FFD1D5DB',
  cinza: 'FF6B7280',
  texto: 'FF1F2937',
  fundoFiltro: 'FFF3F4F6',
};

// chaves normalizadas (minúsculas, sem acento) — mesmas cores do PDF
const COR_STATUS: Record<string, string> = {
  aberta: 'FFFEE2E2',
  'em andamento': 'FFFEF3C7',
  concluida: 'FFDCFCE7',
  cancelada: 'FFE5E7EB',
};

const COR_PRIORIDADE: Record<string, string> = {
  critica: 'FFFCA5A5',
  alta: 'FFFED7AA',
  media: 'FFFEF9C3',
  baixa: 'FFE5E7EB',
};

const LADO = { style: 'thin' as const, color: { argb: COR.borda } };
const BORDA: Partial<ExcelJS.Borders> = {
  top: LADO,
  left: LADO,
  bottom: LADO,
  right: LADO,
};

const ROTULOS_AGRUPAMENTO: Record<string, string> = {
  status: 'Status',
  prioridade: 'Prioridade',
  ambiente: 'Ambiente',
  tecnico: 'Técnico',
  data: 'Data',
  total: 'Total',
};

const TZ = 'America/Sao_Paulo';

// ---- Medidas padrão (iguais em todas as planilhas) ----
const LOGO_PX = 64;
const INDENT_TITULO = 10; // recuo do título para não ficar sobre o logo
const LINHA_SECAO = 6; // título da seção
const LINHA_TABELA = 7; // cabeçalho da tabela principal
const ALTURA_LINHA = 20;
const ALTURA_CABECALHO = 22;
const LARGURA_PADRAO = 8.43; // largura de uma coluna que não foi definida

// ---- Largura do cabeçalho (em "caracteres" do Excel) ----
const INDENT_UNIDADES = 13; // espaço do logo + recuo do título
const TITULO_UNIDADES = 42; // largura do título (fonte 20, negrito)
const FATOR_SUBTITULO = 0.9; // largura de cada caractere do subtítulo (fonte 9)

// Largura mínima para o título e o subtítulo caberem sem corte.
// Cresce sozinha se o nome de quem gerou for longo.
const larguraDoTopo = (subtitulo: string) =>
  Math.ceil(
    INDENT_UNIDADES + Math.max(TITULO_UNIDADES, subtitulo.length * FATOR_SUBTITULO),
  );

// Dados comuns a todas as planilhas do arquivo
interface Contexto {
  origem: string; // "Gerado em ... por Nome (perfil)"
  geradoEm: string;
  larguraTopo: number;
}

const rodapeImpressao = (geradoEm: string) =>
  `&L&8N.O.S • Gerado em ${geradoEm}&R&8Página &P de &N`;

const norm = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const preencher = (cell: ExcelJS.Cell, argb: string) => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
};

// Estilo dos cabeçalhos de tabela (azul, texto branco, centralizado).
const estilizarCabecalho = (row: ExcelJS.Row) => {
  row.height = ALTURA_CABECALHO;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COR.branco } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDA;
    preencher(cell, COR.primaria);
  });
};

// O banco guarda a hora local (ex.: 22:30) e o Node a lê como UTC.
// O ExcelJS grava pelos campos UTC, então basta repassar a data sem ajuste.
const paraExcel = (d?: Date | string | null): Date | null => {
  if (!d) return null;
  const data = new Date(d);
  return Number.isNaN(data.getTime()) ? null : data;
};

// Só a data (Excel: dd/mm/aaaa)
const soData = (d?: Date | string | null): Date | null => {
  const dt = paraExcel(d);
  return dt
    ? new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()))
    : null;
};

// Só a hora, como fração do dia (Excel: hh:mm). Os segundos são descartados,
// igual ao PDF.
const soHora = (d?: Date | string | null): number | null => {
  const dt = paraExcel(d);
  return dt ? (dt.getUTCHours() * 60 + dt.getUTCMinutes()) / 1440 : null;
};

const formatarDia = (valor: unknown): string => {
  const [ano, mes, dia] = (
    valor instanceof Date ? valor.toISOString() : String(valor)
  )
    .slice(0, 10)
    .split('-');
  return `${dia}/${mes}/${ano}`;
};

// Valores da planilha de agrupamento: nulos viram "-", totais viram número
// (o MySQL pode devolver count(*) como string) e datas viram dd/mm/aaaa.
const formatarCelula = (chave: string, valor: unknown): string | number => {
  if (valor === null || valor === undefined) return '-';
  if (chave === 'total') return Number(valor);
  if (valor instanceof Date) return formatarDia(valor);
  if (chave === 'data' && /^\d{4}-\d{2}-\d{2}/.test(String(valor))) {
    return formatarDia(valor);
  }
  return String(valor);
};

// Faixa do topo, igual em todas as planilhas: logo + título + subtítulo + linha azul.
// Ocupa EXATAMENTE as colunas da tabela (a tabela é alargada para caber, veja
// criarAbaTabela). As células da faixa ficam brancas, o que esconde a grade
// atrás do logo. As larguras das colunas precisam estar definidas ANTES de chamar.
const montarTopo = (
  workbook: ExcelJS.Workbook,
  aba: ExcelJS.Worksheet,
  subtitulo: string,
  ultimaColuna: number,
) => {
  const fim = aba.getColumn(ultimaColuna).letter;

  [1, 2, 3].forEach((l) => (aba.getRow(l).height = 22));
  aba.getRow(4).height = 4;
  aba.getRow(5).height = 8;

  for (let l = 1; l <= 5; l++) {
    for (let c = 1; c <= ultimaColuna; c++) {
      preencher(aba.getCell(l, c), l === 4 ? COR.primaria : COR.branco);
    }
  }

  const titulo = aba.getCell('A1');
  titulo.value = 'Relatório de Ocorrências';
  titulo.font = { size: 20, bold: true, color: { argb: COR.primaria } };
  titulo.alignment = {
    vertical: 'bottom',
    horizontal: 'left',
    indent: INDENT_TITULO,
  };
  aba.mergeCells(`A1:${fim}2`);

  const sub = aba.getCell('A3');
  sub.value = subtitulo;
  sub.font = { size: 9, color: { argb: COR.cinza } };
  sub.alignment = {
    vertical: 'top',
    horizontal: 'left',
    indent: INDENT_TITULO,
  };
  aba.mergeCells(`A3:${fim}3`);

  // Logo: ~8px da borda esquerda, centralizado na altura das 3 linhas.
  const larguraA = aba.getColumn(1).width ?? LARGURA_PADRAO;
  const logoId = workbook.addImage({
    buffer: logoBuffer as unknown as ExcelJS.Buffer,
    extension: 'png',
  });
  aba.addImage(logoId, {
    tl: { col: Math.min(0.95, 8 / (larguraA * 1.05)), row: 0.5 },
    ext: { width: LOGO_PX, height: LOGO_PX },
  });
};

// Título de seção (texto azul com fio fino embaixo), na largura da tabela.
const tituloSecao = (
  aba: ExcelJS.Worksheet,
  linha: number,
  texto: string,
  ultimaColuna: number,
) => {
  const fim = aba.getColumn(ultimaColuna).letter;
  const c = aba.getCell(`A${linha}`);
  c.value = texto;
  c.font = { bold: true, size: 11, color: { argb: COR.primaria } };
  c.alignment = { vertical: 'middle', horizontal: 'left' };
  c.border = { bottom: { style: 'thin', color: { argb: COR.primaria } } };
  if (ultimaColuna > 1) aba.mergeCells(`A${linha}:${fim}${linha}`);
  aba.getRow(linha).height = ALTURA_LINHA;
};

interface OpcoesAba {
  nome: string; // nome da planilha
  titulo: string; // título da seção
  tabela: string; // nome da tabela nativa (único no arquivo)
  colunas: string[];
  larguras: number[]; // larguras mínimas desejadas
  colunaFlex?: number; // coluna (a partir de 0) que absorve a folga; padrão: a última
  linhas: ExcelJS.CellValue[][];
  orientacao?: 'portrait' | 'landscape';
  centralizadas?: number[]; // colunas centralizadas (a partir de 1)
}

// Cria uma planilha com a faixa do topo + uma tabela nativa do Excel.
// Devolve a planilha para quem quiser aplicar formatações extras.
const criarAbaTabela = (
  workbook: ExcelJS.Workbook,
  ctx: Contexto,
  o: OpcoesAba,
): ExcelJS.Worksheet => {
  // Cada coluna tem no mínimo o tamanho do próprio título (em negrito) mais
  // espaço para o botão de filtro, para o cabeçalho nunca ficar cortado.
  const larguras = o.colunas.map((nome, i) =>
    Math.max(o.larguras[i] ?? 0, Math.ceil(nome.length * 1.15) + 4),
  );

  // Se a tabela for mais estreita que a faixa do topo, a coluna flexível
  // absorve a diferença: tabela e faixa ficam com a mesma largura.
  const soma = larguras.reduce((a, b) => a + b, 0);
  if (soma < ctx.larguraTopo) {
    larguras[o.colunaFlex ?? larguras.length - 1] += ctx.larguraTopo - soma;
  }

  const aba = workbook.addWorksheet(o.nome, {
    properties: { tabColor: { argb: COR.primaria } },
    views: [{ state: 'frozen', ySplit: LINHA_TABELA }],
    pageSetup: {
      orientation: o.orientacao ?? 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: `${LINHA_TABELA}:${LINHA_TABELA}`,
    },
    headerFooter: { oddFooter: rodapeImpressao(ctx.geradoEm) },
  });
  larguras.forEach((w, i) => {
    aba.getColumn(i + 1).width = w;
  });

  montarTopo(workbook, aba, ctx.origem, o.colunas.length);
  tituloSecao(aba, LINHA_SECAO, o.titulo, o.colunas.length);

  // Sem linhas, o ExcelJS não gera uma tabela válida: só cabeçalho + aviso.
  if (!o.linhas.length) {
    aba.getRow(LINHA_TABELA).values = o.colunas;
    estilizarCabecalho(aba.getRow(LINHA_TABELA));
    const aviso = aba.getCell(`A${LINHA_TABELA + 1}`);
    aviso.value = 'Sem dados para os filtros informados.';
    aviso.font = { italic: true, color: { argb: COR.cinza } };
    return aba;
  }

  aba.addTable({
    name: o.tabela,
    ref: `A${LINHA_TABELA}`,
    headerRow: true,
    totalsRow: false,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: o.colunas.map((name) => ({ name, filterButton: true })),
    rows: o.linhas,
  });

  // Cabeçalho na cor da marca (sobrepõe o azul padrão da tabela)
  estilizarCabecalho(aba.getRow(LINHA_TABELA));

  const centro = o.centralizadas ?? [];
  o.linhas.forEach((valores, i) => {
    const row = aba.getRow(LINHA_TABELA + 1 + i);

    // Altura conforme o texto que mais quebra em várias linhas
    const quebras = valores.map((v, c) =>
      typeof v === 'string'
        ? Math.ceil(v.length / Math.max(1, Math.floor(larguras[c] * 0.9)))
        : 1,
    );
    row.height = ALTURA_LINHA + (Math.max(1, ...quebras) - 1) * 13;

    for (let c = 1; c <= o.colunas.length; c++) {
      const cell = row.getCell(c);
      cell.border = BORDA;
      cell.alignment = {
        vertical: 'middle',
        horizontal: centro.includes(c) ? 'center' : 'left',
        wrapText: true,
      };
    }
  });

  return aba;
};

@Injectable()
export class ExcelExporter {
  // Recebe o MESMO objeto do PDF (RelatorioDados); o agrupamento é opcional
  // e só gera uma planilha extra quando o usuário pede "agruparPor".
  async gerar(dados: RelatorioDados & { agrupamento?: any[] }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'N.O.S';
    workbook.created = new Date();

    const agora = new Date();
    const geradoEm = agora.toLocaleString('pt-BR', { timeZone: TZ });
    const origem = `Gerado em ${geradoEm} por ${dados.geradoPor.nome} (${dados.geradoPor.perfil})`;
    const ctx: Contexto = {
      origem,
      geradoEm,
      larguraTopo: larguraDoTopo(origem),
    };

    this.montarResumo(workbook, dados, ctx);
    this.montarOcorrencias(workbook, dados.linhas, ctx);

    const rk = dados.rankings;
    if (rk?.ambientes) {
      this.montarRanking(workbook, ctx, {
        nome: 'Ambientes',
        titulo: 'Ambientes com mais ocorrências',
        tabela: 'TabelaAmbientes',
        rotuloNome: 'Ambiente',
        rotuloTotal: 'Ocorrências',
        itens: rk.ambientes,
      });
    }
    if (rk?.componentes) {
      this.montarRanking(workbook, ctx, {
        nome: 'Componentes',
        titulo: 'Componentes com mais falhas',
        tabela: 'TabelaComponentes',
        rotuloNome: 'Componente',
        rotuloTotal: 'Falhas',
        itens: rk.componentes,
      });
    }
    // O service só envia este ranking quando o relatório é gerado por admin.
    if (rk?.tecnicos) {
      this.montarRanking(workbook, ctx, {
        nome: 'Técnicos',
        titulo: 'Técnicos com mais atendimentos',
        tabela: 'TabelaTecnicos',
        rotuloNome: 'Técnico',
        rotuloTotal: 'Atendimentos',
        itens: rk.tecnicos,
      });
    }

    if (dados.agrupamento?.length) {
      this.montarAgrupamento(workbook, dados.agrupamento, ctx);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      nomeArquivo: `relatorio-ocorrencias-${agora.toLocaleDateString('en-CA', { timeZone: TZ })}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ---------- Planilha Resumo: filtros + indicadores + por prioridade ----------
  private montarResumo(
    workbook: ExcelJS.Workbook,
    dados: RelatorioDados,
    ctx: Contexto,
  ) {
    const COLUNAS = 2; // A: rótulo | B: valor — faixa e tabelas com a mesma largura
    const larguraA = 30;
    const larguraB = Math.max(30, ctx.larguraTopo - larguraA);

    const aba = workbook.addWorksheet('Resumo', {
      properties: { tabColor: { argb: COR.primaria } },
      pageSetup: {
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
      headerFooter: { oddFooter: rodapeImpressao(ctx.geradoEm) },
    });
    aba.columns = [{ width: larguraA }, { width: larguraB }];

    montarTopo(workbook, aba, ctx.origem, COLUNAS);

    const r = dados.resumo;
    const f = dados.filtros ?? {};

    // ----- Filtros aplicados (linhas 6 a 11) -----
    tituloSecao(aba, LINHA_SECAO, 'Filtros aplicados', COLUNAS);

    const periodo =
      f.inicio || f.fim
        ? `${f.inicio ? formatarDia(f.inicio) : '-'} a ${f.fim ? formatarDia(f.fim) : '-'}`
        : 'Todo o período';

    const filtros: [string, string][] = [
      ['Período', periodo],
      ['Ambiente', f.ambiente ?? 'Todos'],
      ['Status', f.status ?? 'Todos'],
      ['Prioridade', f.prioridade ?? 'Todas'],
      ['Técnico', f.tecnico ?? 'Todos'],
    ];

    filtros.forEach(([rotulo, valor], i) => {
      const linha = 7 + i;
      const quebras = Math.ceil(valor.length / Math.max(1, Math.floor(larguraB * 0.9)));
      aba.getRow(linha).height = ALTURA_LINHA + (Math.max(1, quebras) - 1) * 13;

      const a = aba.getCell(`A${linha}`);
      a.value = rotulo;
      a.font = { bold: true };
      a.alignment = { vertical: 'middle', horizontal: 'left' };
      a.border = BORDA;
      preencher(a, COR.fundoFiltro);

      const b = aba.getCell(`B${linha}`);
      b.value = valor;
      b.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      b.border = BORDA;
    });

    // ----- Indicadores (tabela nativa, linhas 13 a 20) -----
    tituloSecao(aba, 13, 'Indicadores', COLUNAS);

    const semTempo = r.concluidas === 0 || r.tempoMedioHoras == null;
    aba.addTable({
      name: 'TabelaIndicadores',
      ref: 'A14',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: [
        { name: 'Indicador', filterButton: false },
        { name: 'Quantidade', filterButton: false },
      ],
      rows: [
        ['Total de ocorrências', r.total],
        ['Abertas', r.abertas],
        ['Em andamento', r.emAndamento],
        ['Concluídas', r.concluidas],
        ['Canceladas', r.canceladas],
        ['Tempo médio de atendimento', semTempo ? '—' : (r.tempoMedioHoras as number)],
      ],
    });
    estilizarCabecalho(aba.getRow(14));

    for (let i = 0; i < 6; i++) {
      const row = aba.getRow(15 + i);
      row.height = ALTURA_LINHA;
      const a = row.getCell(1);
      const b = row.getCell(2);
      a.border = BORDA;
      b.border = BORDA;
      a.font = { bold: true };
      a.alignment = { vertical: 'middle', horizontal: 'left' };
      b.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    if (!semTempo) aba.getCell('B20').numFmt = '0.0 "h"';

    // ----- Por prioridade (tabela nativa, a partir da linha 22) -----
    if (dados.porPrioridade) {
      tituloSecao(aba, 22, 'Ocorrências por prioridade', COLUNAS);

      const itens = Object.entries(dados.porPrioridade);

      if (!itens.length) {
        aba.getRow(23).values = ['Prioridade', 'Quantidade'];
        estilizarCabecalho(aba.getRow(23));
        const aviso = aba.getCell('A24');
        aviso.value = 'Sem dados para os filtros informados.';
        aviso.font = { italic: true, color: { argb: COR.cinza } };
        return;
      }

      aba.addTable({
        name: 'TabelaPrioridades',
        ref: 'A23',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
          { name: 'Prioridade', filterButton: false },
          { name: 'Quantidade', filterButton: false },
        ],
        rows: itens.map(([prioridade, qtd]) => [prioridade, Number(qtd)]),
      });
      estilizarCabecalho(aba.getRow(23));

      itens.forEach(([prioridade], i) => {
        const row = aba.getRow(24 + i);
        row.height = ALTURA_LINHA;
        const a = row.getCell(1);
        const b = row.getCell(2);
        a.border = BORDA;
        b.border = BORDA;
        a.alignment = { vertical: 'middle', horizontal: 'left' };
        b.alignment = { vertical: 'middle', horizontal: 'center' };
        const cor = COR_PRIORIDADE[norm(prioridade)];
        if (cor) preencher(a, cor);
      });
    }
  }

  // ---------- Planilha Ocorrências (data e hora em colunas separadas) ----------
  private montarOcorrencias(
    workbook: ExcelJS.Workbook,
    linhas: RelatorioDados['linhas'],
    ctx: Contexto,
  ) {
    const aba = criarAbaTabela(workbook, ctx, {
      nome: 'Ocorrências',
      titulo: `Detalhamento das ocorrências (${linhas.length})`,
      tabela: 'TabelaOcorrencias',
      orientacao: 'landscape',
      colunas: [
        'Nº', 'Título', 'Status', 'Prioridade', 'Ambiente', 'Componente',
        'Criado por', 'Técnico(s)',
        'Data de abertura', 'Hora de abertura',
        'Data de encerramento', 'Hora de encerramento',
      ],
      larguras: [8, 32, 16, 13, 20, 20, 22, 36, 17, 14, 20, 14],
      centralizadas: [1, 3, 4, 9, 10, 11, 12],
      linhas: linhas.map((l) => [
        l.id,
        l.titulo ?? '-',
        l.status,
        l.prioridade,
        l.ambiente ?? '-',
        l.componente ?? '-',
        l.criadoPor ?? '-',
        l.tecnicos ?? '-',
        soData(l.criadoEm) ?? '-',
        soHora(l.criadoEm) ?? '-',
        soData(l.encerradoEm) ?? '-',
        soHora(l.encerradoEm) ?? '-',
      ]),
    });

    // Cores de status e prioridade (iguais ao PDF) e formato das datas/horas
    linhas.forEach((l, i) => {
      const row = aba.getRow(LINHA_TABELA + 1 + i);

      const corStatus = COR_STATUS[norm(l.status)];
      if (corStatus) preencher(row.getCell(3), corStatus);
      const corPrioridade = COR_PRIORIDADE[norm(l.prioridade)];
      if (corPrioridade) preencher(row.getCell(4), corPrioridade);

      row.getCell(9).numFmt = 'dd/mm/yyyy';
      row.getCell(10).numFmt = 'hh:mm';
      row.getCell(11).numFmt = 'dd/mm/yyyy';
      row.getCell(12).numFmt = 'hh:mm';
    });
  }

  // ---------- Planilhas de ranking (Ambientes, Componentes, Técnicos) ----------
  private montarRanking(
    workbook: ExcelJS.Workbook,
    ctx: Contexto,
    o: {
      nome: string;
      titulo: string;
      tabela: string;
      rotuloNome: string;
      rotuloTotal: string;
      itens: RankingItem[];
    },
  ) {
    criarAbaTabela(workbook, ctx, {
      nome: o.nome,
      titulo: o.titulo,
      tabela: o.tabela,
      colunas: ['Posição', o.rotuloNome, o.rotuloTotal],
      larguras: [10, 34, 16],
      colunaFlex: 1, // o nome absorve a folga até a largura do cabeçalho
      centralizadas: [1, 3],
      linhas: o.itens.map((item, i) => [i + 1, item.nome, Number(item.total)]),
    });
  }

  // ---------- Planilha Agrupamento (extra, só quando pedida) ----------
  private montarAgrupamento(
    workbook: ExcelJS.Workbook,
    agrupamento: any[],
    ctx: Contexto,
  ) {
    const chaves = Object.keys(agrupamento[0]);
    const criterio = (ROTULOS_AGRUPAMENTO[chaves[0]] ?? chaves[0]).toLowerCase();

    criarAbaTabela(workbook, ctx, {
      nome: 'Agrupamento',
      titulo: `Agrupamento por ${criterio}`,
      tabela: 'TabelaAgrupamento',
      colunas: chaves.map((c) => ROTULOS_AGRUPAMENTO[c] ?? c),
      larguras: chaves.map(() => 24),
      colunaFlex: 0, // a primeira coluna (o critério) absorve a folga
      centralizadas: chaves
        .map((c, i) => (c === 'total' ? i + 1 : 0))
        .filter((i) => i > 0),
      linhas: agrupamento.map((item) =>
        chaves.map((c) => formatarCelula(c, item[c])),
      ),
    });
  }
}