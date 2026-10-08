import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

interface LinhaExcel {
  id: number;
  nome: string | null;
  criado_por: string | null;
  tecnico_responsavel: string | null;
  status: string;
  prioridade: string;
  criado_em: Date | null;
  encerrado_em: Date | null;
  ambiente: string | null;
  componente: string | null;
}

interface ResumoExcel {
  total: number;
  abertas: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  tempoMedioHoras: number | null;
}

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

// Tons suaves (fundo de células de status/prioridade)
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

// Tons fortes (números e barras do painel)
const FORTE = {
  total: 'FF0B2E8A',
  aberta: 'FFDC2626',
  andamento: 'FFD97706',
  concluida: 'FF16A34A',
  cancelada: 'FF4B5563',
  tempo: 'FF0E7490',
};

const LADO = { style: 'thin' as const, color: { argb: COR.borda } };
const BORDA: Partial<ExcelJS.Borders> = {
  top: LADO,
  left: LADO,
  bottom: LADO,
  right: LADO,
};
const BRANCO_MEDIO = { style: 'medium' as const, color: { argb: COR.branco } };

const ROTULOS_AGRUPAMENTO: Record<string, string> = {
  status: 'Status',
  prioridade: 'Prioridade',
  ambiente: 'Ambiente',
  tecnico: 'Técnico',
  data: 'Data',
  total: 'Total',
};

const TZ = 'America/Sao_Paulo';

// ---- Medidas padrão (iguais em todas as abas) ----
const LOGO_PX = 64; // tamanho do logo
const INDENT_TITULO = 10; // recuo do título para não ficar sobre o logo
const LINHA_SECAO = 6; // título de seção
const LINHA_TABELA = 7; // cabeçalho da tabela principal
const ALTURA_LINHA = 20; // altura padrão das linhas de tabela
const ALTURA_CABECALHO = 22;
const RODAPE_IMPRESSAO = '&L&8N.O.S&C&8Página &P de &N&R&8&D';

const norm = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const preencher = (cell: ExcelJS.Cell, argb: string) => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
};

// Estilo padrão dos cabeçalhos de tabela (azul, texto branco, centralizado).
const estilizarCabecalho = (row: ExcelJS.Row) => {
  row.height = ALTURA_CABECALHO;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COR.branco } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDA;
    preencher(cell, COR.primaria);
  });
};

interface OpcoesBloco {
  valor?: ExcelJS.CellValue;
  fonte?: Partial<ExcelJS.Font>;
  fundo?: string;
  borda?: Partial<ExcelJS.Borders>;
  alinhamento?: Partial<ExcelJS.Alignment>;
  numFmt?: string;
}

// Estiliza a célula principal e só depois mescla a área, para que as
// células mescladas herdem o mesmo estilo.
const bloco = (
  aba: ExcelJS.Worksheet,
  l1: number,
  c1: number,
  l2: number,
  c2: number,
  o: OpcoesBloco,
) => {
  const cell = aba.getCell(l1, c1);
  if (o.valor !== undefined) cell.value = o.valor;
  if (o.fonte) cell.font = o.fonte;
  if (o.fundo) preencher(cell, o.fundo);
  if (o.borda) cell.border = o.borda;
  if (o.alinhamento) cell.alignment = o.alinhamento;
  if (o.numFmt) cell.numFmt = o.numFmt;
  if (l1 !== l2 || c1 !== c2) aba.mergeCells(l1, c1, l2, c2);
};

// A Date que vem do banco já traz o horário gravado (ex.: 22:30) marcado como UTC.
// O ExcelJS grava pelos campos UTC, então basta repassar a data sem ajuste.
const paraExcel = (d: Date | null): Date | null => {
  if (!d) return null;
  const data = new Date(d);
  return Number.isNaN(data.getTime()) ? null : data;
};

const formatarDia = (valor: unknown): string => {
  const [ano, mes, dia] = (
    valor instanceof Date ? valor.toISOString() : String(valor)
  )
    .slice(0, 10)
    .split('-');
  return `${dia}/${mes}/${ano}`;
};

// Valores da aba de agrupamento: nulos viram "-", totais viram número
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

// Faixa do topo, igual em todas as abas: logo + título + subtítulo + linha azul.
// As células da faixa ficam brancas, o que esconde a grade atrás do logo.
// As colunas da aba precisam estar com a largura definida ANTES de chamar.
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

  // Título (o recuo deixa espaço para o logo)
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
  // (o ExcelJS calcula o deslocamento fracionário como fração * largura * 10000 EMU)
  const larguraA = aba.getColumn(1).width ?? 8.43;
  const logoId = workbook.addImage({
    buffer: logoBuffer as unknown as ExcelJS.Buffer,
    extension: 'png',
  });
  aba.addImage(logoId, {
    tl: { col: Math.min(0.95, 8 / (larguraA * 1.05)), row: 0.5 },
    ext: { width: LOGO_PX, height: LOGO_PX },
  });
};

// Título de seção padrão (linha 6 e demais blocos do Resumo).
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
  aba.mergeCells(`A${linha}:${fim}${linha}`);
  aba.getRow(linha).height = ALTURA_LINHA;
};

@Injectable()
export class ExcelExporter {
  async gerar(dados: {
    filtros: any;
    resumo: ResumoExcel;
    agrupamento?: any[];
    linhas: LinhaExcel[];
  }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'N.O.S';
    workbook.created = new Date();

    const geradoEm = new Date().toLocaleString('pt-BR', { timeZone: TZ });

    this.montarResumo(workbook, dados, geradoEm);
    this.montarOcorrencias(workbook, dados.linhas, geradoEm);
    if (dados.agrupamento?.length) {
      this.montarAgrupamento(workbook, dados.agrupamento, geradoEm);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      nomeArquivo: `relatorio-ocorrencias-${new Date().toLocaleDateString('en-CA', { timeZone: TZ })}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ---------- Aba Resumo (cabeçalho padrão + painel) ----------
  private montarResumo(
    workbook: ExcelJS.Workbook,
    dados: { filtros: any; resumo: ResumoExcel },
    geradoEm: string,
  ) {
    const COLUNAS = 12;
    const aba = workbook.addWorksheet('Resumo', {
      properties: { tabColor: { argb: COR.primaria } },
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
      },
      headerFooter: { oddFooter: RODAPE_IMPRESSAO },
    });
    aba.columns = Array.from({ length: COLUNAS }, () => ({ width: 12 }));

    // Linhas 1 a 5: faixa do topo (igual às outras abas)
    montarTopo(workbook, aba, `Resumo  •  Gerado em ${geradoEm}`, COLUNAS);

    const r = dados.resumo;
    const f = dados.filtros ?? {};

    // ----- Filtros aplicados (linhas 6 a 8) -----
    tituloSecao(aba, LINHA_SECAO, 'Filtros aplicados', COLUNAS);

    const periodo =
      f.data_inicial || f.data_final
        ? `${f.data_inicial ? formatarDia(f.data_inicial) : 'início'} a ${f.data_final ? formatarDia(f.data_final) : 'hoje'}`
        : 'Todo o período';

    const chips: { rotulo: string; valor: string; de: number; ate: number }[] = [
      { rotulo: 'PERÍODO', valor: periodo, de: 1, ate: 3 },
      {
        rotulo: 'AMBIENTE',
        valor: f.ambienteNome ?? (f.ambiente ? `ID ${f.ambiente}` : 'Todos'),
        de: 4,
        ate: 5,
      },
      { rotulo: 'STATUS', valor: f.status ?? 'Todos', de: 6, ate: 7 },
      { rotulo: 'PRIORIDADE', valor: f.prioridade ?? 'Todas', de: 8, ate: 9 },
      {
        rotulo: 'TÉCNICO',
        valor: f.tecnicoNome ?? (f.tecnico ? `ID ${f.tecnico}` : 'Todos'),
        de: 10,
        ate: 12,
      },
    ];

    aba.getRow(7).height = 18;
    aba.getRow(8).height = 26;
    chips.forEach((c) => {
      bloco(aba, 7, c.de, 7, c.ate, {
        valor: c.rotulo,
        fonte: { size: 8, bold: true, color: { argb: COR.cinza } },
        fundo: COR.fundoFiltro,
        borda: { left: BRANCO_MEDIO },
        alinhamento: { vertical: 'bottom', horizontal: 'left', indent: 1 },
      });
      bloco(aba, 8, c.de, 8, c.ate, {
        valor: c.valor,
        fonte: { size: 12, bold: true, color: { argb: COR.texto } },
        fundo: COR.fundoFiltro,
        borda: { left: BRANCO_MEDIO },
        alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
      });
    });
    aba.getRow(9).height = 10;

    // ----- Indicadores: cartões (linhas 10 a 13) -----
    tituloSecao(aba, 10, 'Indicadores', COLUNAS);

    const cards: {
      rotulo: string;
      valor: number | string;
      cor: string;
      fundo: string;
      numFmt?: string;
    }[] = [
      { rotulo: 'TOTAL', valor: r.total, cor: FORTE.total, fundo: 'FFE0E7FF' },
      { rotulo: 'ABERTAS', valor: r.abertas, cor: FORTE.aberta, fundo: COR_STATUS.aberta },
      { rotulo: 'EM ANDAMENTO', valor: r.emAndamento, cor: FORTE.andamento, fundo: COR_STATUS['em andamento'] },
      { rotulo: 'CONCLUÍDAS', valor: r.concluidas, cor: FORTE.concluida, fundo: COR_STATUS.concluida },
      { rotulo: 'CANCELADAS', valor: r.canceladas, cor: FORTE.cancelada, fundo: COR_STATUS.cancelada },
      {
        rotulo: 'TEMPO MÉDIO',
        valor: r.tempoMedioHoras ?? '-',
        cor: FORTE.tempo,
        fundo: 'FFCFFAFE',
        numFmt: r.tempoMedioHoras !== null ? '0.0 "h"' : undefined,
      },
    ];

    aba.getRow(11).height = 22;
    aba.getRow(12).height = 24;
    aba.getRow(13).height = 24;

    cards.forEach((card, i) => {
      const c1 = 1 + i * 2;
      const c2 = c1 + 1;
      const lados = { left: BRANCO_MEDIO, right: BRANCO_MEDIO };

      bloco(aba, 11, c1, 11, c2, {
        valor: card.rotulo,
        fonte: { size: 9, bold: true, color: { argb: card.cor } },
        fundo: card.fundo,
        borda: { ...lados, top: { style: 'thick', color: { argb: card.cor } } },
        alinhamento: { vertical: 'middle', horizontal: 'center' },
      });
      bloco(aba, 12, c1, 13, c2, {
        valor: card.valor,
        fonte: { size: 28, bold: true, color: { argb: card.cor } },
        fundo: card.fundo,
        borda: lados,
        alinhamento: { vertical: 'middle', horizontal: 'center' },
        numFmt: card.numFmt,
      });
    });
    aba.getRow(14).height = 10;

    // ----- Distribuição por status (linhas 15 a 20) -----
    tituloSecao(aba, 15, 'Distribuição por status', COLUNAS);

    const cabecalho = (c1: number, c2: number, texto: string) =>
      bloco(aba, 16, c1, 16, c2, {
        valor: texto,
        fonte: { bold: true, color: { argb: COR.branco } },
        fundo: COR.primaria,
        borda: BORDA,
        alinhamento: { vertical: 'middle', horizontal: 'center' },
      });
    aba.getRow(16).height = ALTURA_CABECALHO;
    cabecalho(1, 3, 'Status');
    cabecalho(4, 4, 'Qtd');
    cabecalho(5, 5, '%');
    cabecalho(6, 12, 'Proporção');

    const distribuicao = [
      { rotulo: 'Abertas', qtd: r.abertas, cor: FORTE.aberta, fundo: COR_STATUS.aberta },
      { rotulo: 'Em andamento', qtd: r.emAndamento, cor: FORTE.andamento, fundo: COR_STATUS['em andamento'] },
      { rotulo: 'Concluídas', qtd: r.concluidas, cor: FORTE.concluida, fundo: COR_STATUS.concluida },
      { rotulo: 'Canceladas', qtd: r.canceladas, cor: FORTE.cancelada, fundo: COR_STATUS.cancelada },
    ];

    const BLOCOS_100_PORCENTO = 56;
    distribuicao.forEach((d, i) => {
      const linha = 17 + i;
      const pct = r.total ? d.qtd / r.total : 0;
      let blocos = Math.round(pct * BLOCOS_100_PORCENTO);
      if (d.qtd > 0 && blocos === 0) blocos = 1;

      aba.getRow(linha).height = 22;
      bloco(aba, linha, 1, linha, 3, {
        valor: d.rotulo,
        fonte: { bold: true, color: { argb: d.cor } },
        fundo: d.fundo,
        borda: BORDA,
        alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
      });
      bloco(aba, linha, 4, linha, 4, {
        valor: d.qtd,
        fonte: { bold: true },
        borda: BORDA,
        alinhamento: { vertical: 'middle', horizontal: 'center' },
      });
      bloco(aba, linha, 5, linha, 5, {
        valor: pct,
        numFmt: '0.0%',
        borda: BORDA,
        alinhamento: { vertical: 'middle', horizontal: 'center' },
      });
      bloco(aba, linha, 6, linha, 12, {
        valor: '█'.repeat(blocos),
        fonte: { size: 10, color: { argb: d.cor } },
        borda: BORDA,
        alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
      });
    });
  }

  // ---------- Aba Ocorrências ----------
  private montarOcorrencias(
    workbook: ExcelJS.Workbook,
    linhas: LinhaExcel[],
    geradoEm: string,
  ) {
    const formatoData = 'dd/mm/yyyy hh:mm';
    const colunas = [
      'ID', 'Nome', 'Status', 'Prioridade', 'Ambiente',
      'Componente', 'Solicitante', 'Técnico(s)', 'Criado em', 'Encerrado em',
    ];

    const aba = workbook.addWorksheet('Ocorrências', {
      properties: { tabColor: { argb: COR.primaria } },
      views: [{ state: 'frozen', ySplit: LINHA_TABELA }],
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: `${LINHA_TABELA}:${LINHA_TABELA}`,
      },
      headerFooter: { oddFooter: RODAPE_IMPRESSAO },
    });
    [8, 32, 16, 13, 20, 20, 22, 26, 18, 18].forEach((w, i) => {
      aba.getColumn(i + 1).width = w;
    });

    montarTopo(
      workbook,
      aba,
      `Detalhamento das ocorrências  •  Gerado em ${geradoEm}`,
      colunas.length,
    );
    tituloSecao(
      aba,
      LINHA_SECAO,
      `Detalhamento das ocorrências (${linhas.length})`,
      colunas.length,
    );

    // Sem linhas, o ExcelJS não gera uma tabela válida: só cabeçalho + aviso.
    if (!linhas.length) {
      aba.getRow(LINHA_TABELA).values = colunas;
      estilizarCabecalho(aba.getRow(LINHA_TABELA));
      aba.getCell(`A${LINHA_TABELA + 1}`).value =
        'Nenhuma ocorrência encontrada para os filtros informados.';
      return;
    }

    aba.addTable({
      name: 'TabelaOcorrencias',
      ref: `A${LINHA_TABELA}`,
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: colunas.map((name) => ({ name, filterButton: true })),
      rows: linhas.map((l) => [
        l.id,
        l.nome ?? '-',
        l.status,
        l.prioridade,
        l.ambiente ?? '-',
        l.componente ?? '-',
        l.criado_por ?? '-',
        l.tecnico_responsavel ?? '-',
        paraExcel(l.criado_em) ?? '-',
        paraExcel(l.encerrado_em) ?? '-',
      ]),
    });

    // Cabeçalho na cor da marca (sobrepõe o azul padrão da tabela)
    estilizarCabecalho(aba.getRow(LINHA_TABELA));

    const centralizadas = [1, 3, 4, 9, 10]; // ID, Status, Prioridade e datas
    linhas.forEach((l, i) => {
      const row = aba.getRow(LINHA_TABELA + 1 + i);
      row.height = ALTURA_LINHA;
      for (let c = 1; c <= colunas.length; c++) {
        const cell = row.getCell(c);
        cell.border = BORDA;
        cell.alignment = {
          vertical: 'middle',
          horizontal: centralizadas.includes(c) ? 'center' : 'left',
          wrapText: true,
        };
      }
      row.getCell(9).numFmt = formatoData;
      row.getCell(10).numFmt = formatoData;

      const corStatus = COR_STATUS[norm(l.status)];
      if (corStatus) preencher(row.getCell(3), corStatus);
      const corPrioridade = COR_PRIORIDADE[norm(l.prioridade)];
      if (corPrioridade) preencher(row.getCell(4), corPrioridade);
    });
  }

  // ---------- Aba Agrupamento ----------
  private montarAgrupamento(
    workbook: ExcelJS.Workbook,
    agrupamento: any[],
    geradoEm: string,
  ) {
    const chaves = Object.keys(agrupamento[0]);
    // A faixa do topo ocupa pelo menos 4 colunas, para o título caber.
    const ultima = Math.max(chaves.length, 4);

    const aba = workbook.addWorksheet('Agrupamento', {
      properties: { tabColor: { argb: COR.primaria } },
      views: [{ state: 'frozen', ySplit: LINHA_TABELA }],
      pageSetup: {
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: `${LINHA_TABELA}:${LINHA_TABELA}`,
      },
      headerFooter: { oddFooter: RODAPE_IMPRESSAO },
    });
    for (let i = 1; i <= ultima; i++) aba.getColumn(i).width = 24;

    montarTopo(
      workbook,
      aba,
      `Agrupamento  •  Gerado em ${geradoEm}`,
      ultima,
    );

    const criterio = (ROTULOS_AGRUPAMENTO[chaves[0]] ?? chaves[0]).toLowerCase();
    tituloSecao(aba, LINHA_SECAO, `Agrupamento por ${criterio}`, ultima);

    aba.addTable({
      name: 'TabelaAgrupamento',
      ref: `A${LINHA_TABELA}`,
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: chaves.map((c) => ({ name: ROTULOS_AGRUPAMENTO[c] ?? c })),
      rows: agrupamento.map((item) =>
        chaves.map((c) => formatarCelula(c, item[c])),
      ),
    });
    estilizarCabecalho(aba.getRow(LINHA_TABELA));

    agrupamento.forEach((_, i) => {
      const row = aba.getRow(LINHA_TABELA + 1 + i);
      row.height = ALTURA_LINHA;
      chaves.forEach((chave, idx) => {
        const cell = row.getCell(idx + 1);
        cell.border = BORDA;
        cell.alignment = {
          vertical: 'middle',
          horizontal: chave === 'total' ? 'center' : 'left',
        };
      });
    });
  }
}

