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

// ---- Medidas padrão ----
const COLUNAS = 24; // grade da aba "Relatório"
const LARGURA_COLUNA = 9;
const LOGO_PX = 64;
const INDENT_TITULO = 10; // recuo do título para não ficar sobre o logo
const LINHA_SECAO = 6; // (aba Agrupamento) título de seção
const LINHA_TABELA = 7; // (aba Agrupamento) cabeçalho da tabela
const ALTURA_LINHA = 20;
const ALTURA_CABECALHO = 22;
const TOP_RANKING = 5;

// Colunas do detalhamento (mesma ordem do PDF), mapeadas na grade de 24 colunas.
const COLUNAS_DETALHE = [
  { titulo: 'Nº', de: 1, ate: 1 },
  { titulo: 'Título', de: 2, ate: 5 },
  { titulo: 'Status', de: 6, ate: 7 },
  { titulo: 'Prioridade', de: 8, ate: 9 },
  { titulo: 'Ambiente', de: 10, ate: 12 },
  { titulo: 'Componente', de: 13, ate: 14 },
  { titulo: 'Criado por', de: 15, ate: 17 },
  { titulo: 'Técnico(s)', de: 18, ate: 20 },
  { titulo: 'Abertura', de: 21, ate: 22 },
  { titulo: 'Encerramento', de: 23, ate: 24 },
];

const rodapeImpressao = (geradoEm: string) =>
  `&L&8N.O.S • Gerado em ${geradoEm}&R&8Página &P de &N`;

const norm = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const preencher = (cell: ExcelJS.Cell, argb: string) => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
};

// Estilo dos cabeçalhos de tabela da aba Agrupamento (azul, texto branco).
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

// O banco guarda a hora local (ex.: 22:30) e o Node a lê como UTC.
// O ExcelJS grava pelos campos UTC, então basta repassar a data sem ajuste.
const paraExcel = (d?: Date | string | null): Date | null => {
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

// Quantas linhas um texto ocupa numa área mesclada (estimativa para a altura da linha).
const linhasNecessarias = (texto: string, colunasMescladas: number) => {
  const capacidade = Math.max(
    1,
    Math.floor(colunasMescladas * LARGURA_COLUNA * 0.85),
  );
  return Math.max(1, Math.ceil(texto.length / capacidade));
};

// Faixa do topo: logo + título + subtítulo + linha azul.
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

// Título de seção (texto azul com fio fino embaixo).
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
  // Recebe o MESMO objeto do PDF (RelatorioDados); o agrupamento é opcional
  // e só gera uma aba extra quando o usuário pede "agruparPor".
  async gerar(dados: RelatorioDados & { agrupamento?: any[] }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'N.O.S';
    workbook.created = new Date();

    const agora = new Date();
    const geradoEm = agora.toLocaleString('pt-BR', { timeZone: TZ });
    const origem = `Gerado em ${geradoEm} por ${dados.geradoPor.nome} (${dados.geradoPor.perfil})`;

    this.montarRelatorio(workbook, dados, origem, geradoEm);
    if (dados.agrupamento?.length) {
      this.montarAgrupamento(workbook, dados.agrupamento, origem, geradoEm);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      nomeArquivo: `relatorio-ocorrencias-${agora.toLocaleDateString('en-CA', { timeZone: TZ })}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ---------- Aba "Relatório" (mesmo esquema do PDF) ----------
  private montarRelatorio(
    workbook: ExcelJS.Workbook,
    dados: RelatorioDados,
    origem: string,
    geradoEm: string,
  ) {
    const aba = workbook.addWorksheet('Relatório', {
      properties: { tabColor: { argb: COR.primaria } },
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
      headerFooter: { oddFooter: rodapeImpressao(geradoEm) },
    });
    aba.columns = Array.from({ length: COLUNAS }, () => ({
      width: LARGURA_COLUNA,
    }));

    // Linhas 1 a 5: faixa do topo
    montarTopo(workbook, aba, origem, COLUNAS);

    let linha = 6;

    // ----- Filtros (linha de texto, igual ao PDF) -----
    const f = dados.filtros ?? {};
    const periodo =
      f.inicio || f.fim
        ? `${f.inicio ? formatarDia(f.inicio) : '-'} a ${f.fim ? formatarDia(f.fim) : '-'}`
        : 'Todo o período';

    const filtros = [
      `Período: ${periodo}`,
      `Ambiente: ${f.ambiente ?? 'Todos'}`,
      `Status: ${f.status ?? 'Todos'}`,
      `Prioridade: ${f.prioridade ?? 'Todas'}`,
      `Técnico: ${f.tecnico ?? 'Todos'}`,
    ].join('   |   ');

    aba.getRow(linha).height = ALTURA_LINHA;
    bloco(aba, linha, 1, linha, COLUNAS, {
      valor: filtros,
      fonte: { size: 9, color: { argb: COR.cinza } },
      alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
    });
    linha++;
    aba.getRow(linha).height = 8;
    linha++;

    // ----- Resumo: cartões -----
    tituloSecao(aba, linha, 'Resumo', COLUNAS);
    linha++;

    const r = dados.resumo;
    const semTempo = r.concluidas === 0 || r.tempoMedioHoras == null;
    const cards: { rotulo: string; valor: number | string; numFmt?: string }[] = [
      { rotulo: 'Total', valor: r.total },
      { rotulo: 'Abertas', valor: r.abertas },
      { rotulo: 'Em andamento', valor: r.emAndamento },
      { rotulo: 'Concluídas', valor: r.concluidas },
      { rotulo: 'Canceladas', valor: r.canceladas },
      {
        rotulo: 'Tempo médio',
        valor: semTempo ? '—' : (r.tempoMedioHoras as number),
        numFmt: semTempo ? undefined : '0.0 "h"',
      },
    ];

    aba.getRow(linha).height = 32;
    aba.getRow(linha + 1).height = 18;
    const largCard = COLUNAS / cards.length; // 4 colunas por cartão
    cards.forEach((c, i) => {
      const c1 = 1 + i * largCard;
      const c2 = c1 + largCard - 1;
      bloco(aba, linha, c1, linha, c2, {
        valor: c.valor,
        fonte: { size: 18, bold: true, color: { argb: COR.primaria } },
        borda: { top: LADO, left: LADO, right: LADO },
        alinhamento: { vertical: 'middle', horizontal: 'center' },
        numFmt: c.numFmt,
      });
      bloco(aba, linha + 1, c1, linha + 1, c2, {
        valor: c.rotulo,
        fonte: { size: 9, color: { argb: COR.cinza } },
        borda: { left: LADO, right: LADO, bottom: LADO },
        alinhamento: { vertical: 'middle', horizontal: 'center' },
      });
    });
    linha += 2;

    // ----- Por prioridade (mesmo texto do PDF) -----
    if (dados.porPrioridade) {
      const texto = Object.entries(dados.porPrioridade)
        .map(([prioridade, qtd]) => `${prioridade}: ${qtd}`)
        .join('   •   ');
      aba.getRow(linha).height = ALTURA_LINHA + 4;
      bloco(aba, linha, 1, linha, COLUNAS, {
        valor: `Por prioridade — ${texto}`,
        fonte: { size: 10, color: { argb: COR.texto } },
        alinhamento: { vertical: 'middle', horizontal: 'left' },
      });
      linha++;
    }

    aba.getRow(linha).height = 10;
    linha++;

    // ----- Análises: rankings lado a lado -----
    linha = this.montarRankings(aba, linha, dados.rankings);

    aba.getRow(linha).height = 10;
    linha++;

    // ----- Detalhamento -----
    this.montarDetalhe(aba, linha, dados.linhas);
  }

  // Tabelas lado a lado, dividindo a largura em partes iguais
  // (3 tabelas para admin, 2 para técnico, que não recebe o ranking de técnicos).
  private montarRankings(
    aba: ExcelJS.Worksheet,
    inicio: number,
    rk?: RelatorioDados['rankings'],
  ): number {
    if (!rk) return inicio;

    const tabelas = [
      { titulo: 'Ambientes com mais ocorrências', itens: rk.ambientes },
      { titulo: 'Componentes com mais falhas', itens: rk.componentes },
      { titulo: 'Técnicos com mais atendimentos', itens: rk.tecnicos },
    ].filter(
      (t): t is { titulo: string; itens: RankingItem[] } => t.itens !== undefined,
    );

    if (!tabelas.length) return inicio;

    let linha = inicio;
    tituloSecao(aba, linha, 'Análises', COLUNAS);
    linha++;

    const largura = COLUNAS / tabelas.length; // 8 ou 12 colunas por tabela
    const faixa = (k: number) => ({ c1: 1 + k * largura, c2: (k + 1) * largura });

    // Cabeçalhos
    aba.getRow(linha).height = ALTURA_CABECALHO;
    tabelas.forEach((t, k) => {
      const { c1, c2 } = faixa(k);
      bloco(aba, linha, c1, linha, c2, {
        valor: t.titulo,
        fonte: { bold: true, color: { argb: COR.branco } },
        fundo: COR.primaria,
        borda: { left: BRANCO_MEDIO, right: BRANCO_MEDIO },
        alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
      });
    });
    linha++;

    // Linhas (top 5 de cada tabela)
    const topos = tabelas.map((t) => t.itens.slice(0, TOP_RANKING));
    const qtdLinhas = Math.max(1, ...topos.map((t) => t.length));

    for (let i = 0; i < qtdLinhas; i++) {
      aba.getRow(linha).height = ALTURA_LINHA;

      tabelas.forEach((_, k) => {
        const { c1, c2 } = faixa(k);
        const topo = topos[k];

        if (topo.length === 0) {
          if (i === 0) {
            bloco(aba, linha, c1, linha, c2, {
              valor: 'Sem dados',
              fonte: { color: { argb: COR.cinza } },
              borda: { left: BRANCO_MEDIO, right: BRANCO_MEDIO, bottom: LADO },
              alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
            });
          }
          return;
        }

        const item = topo[i];
        if (!item) return;

        bloco(aba, linha, c1, linha, c2 - 1, {
          valor: item.nome,
          borda: { left: BRANCO_MEDIO, bottom: LADO },
          alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
        });
        bloco(aba, linha, c2, linha, c2, {
          valor: Number(item.total),
          borda: { right: BRANCO_MEDIO, bottom: LADO },
          alinhamento: { vertical: 'middle', horizontal: 'right', indent: 1 },
        });
      });
      linha++;
    }

    return linha;
  }

  // Detalhamento: mesmas colunas e cores do PDF; abertura e encerramento com horário.
  private montarDetalhe(
    aba: ExcelJS.Worksheet,
    inicio: number,
    linhas: RelatorioDados['linhas'],
  ) {
    let linha = inicio;
    tituloSecao(aba, linha, 'Detalhamento das ocorrências', COLUNAS);
    linha++;

    if (!linhas.length) {
      bloco(aba, linha, 1, linha, COLUNAS, {
        valor: 'Nenhuma ocorrência encontrada para os filtros informados.',
        fonte: { color: { argb: COR.cinza } },
        alinhamento: { vertical: 'middle', horizontal: 'left' },
      });
      return;
    }

    // Cabeçalho (repetido a cada página na impressão)
    aba.getRow(linha).height = ALTURA_CABECALHO;
    COLUNAS_DETALHE.forEach((c) => {
      bloco(aba, linha, c.de, linha, c.ate, {
        valor: c.titulo,
        fonte: { bold: true, color: { argb: COR.branco } },
        fundo: COR.primaria,
        alinhamento: { vertical: 'middle', horizontal: 'left', indent: 1 },
      });
    });
    aba.pageSetup.printTitlesRow = `${linha}:${linha}`;
    linha++;

    const formatoData = 'dd/mm/yyyy hh:mm';

    linhas.forEach((l) => {
      const abertura = paraExcel(l.criadoEm);
      const encerramento = paraExcel(l.encerradoEm);

      // Mesma ordem de COLUNAS_DETALHE
      const valores: ExcelJS.CellValue[] = [
        l.id,
        l.titulo ?? '-',
        l.status,
        l.prioridade,
        l.ambiente ?? '-',
        l.componente ?? '-',
        l.criadoPor ?? '-',
        l.tecnicos ?? '-',
        abertura ?? '-',
        encerramento ?? '-',
      ];

      // Altura da linha conforme o maior texto que quebra em várias linhas
      const necessarias = Math.max(
        linhasNecessarias(String(valores[1]), 4), // título
        linhasNecessarias(String(valores[4]), 3), // ambiente
        linhasNecessarias(String(valores[5]), 2), // componente
        linhasNecessarias(String(valores[6]), 3), // criado por
        linhasNecessarias(String(valores[7]), 3), // técnicos
      );
      aba.getRow(linha).height = ALTURA_LINHA + (necessarias - 1) * 13;

      COLUNAS_DETALHE.forEach((c, idx) => {
        let fundo: string | undefined;
        if (idx === 2) fundo = COR_STATUS[norm(l.status)];
        if (idx === 3) fundo = COR_PRIORIDADE[norm(l.prioridade)];

        bloco(aba, linha, c.de, linha, c.ate, {
          valor: valores[idx],
          fonte: { size: 10, color: { argb: COR.texto } },
          fundo,
          borda: { bottom: LADO },
          alinhamento: {
            vertical: 'middle',
            horizontal: 'left',
            indent: 1,
            wrapText: true,
          },
          numFmt: idx >= 8 ? formatoData : undefined,
        });
      });
      linha++;
    });
  }

  // ---------- Aba Agrupamento (extra, só quando pedida) ----------
  private montarAgrupamento(
    workbook: ExcelJS.Workbook,
    agrupamento: any[],
    origem: string,
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
      headerFooter: { oddFooter: rodapeImpressao(geradoEm) },
    });
    for (let i = 1; i <= ultima; i++) aba.getColumn(i).width = 24;

    montarTopo(workbook, aba, `Agrupamento  •  ${origem}`, ultima);

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