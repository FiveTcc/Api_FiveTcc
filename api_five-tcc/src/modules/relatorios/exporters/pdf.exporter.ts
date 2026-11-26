import { Injectable } from '@nestjs/common';
import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import * as path from 'path';
import * as fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake/src/printer');

const logoDataUri = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), 'src/assets/logo_sem_fundo.png'))
  .toString('base64')}`;

const fonts = {
  Roboto: {
    normal: path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf'),
    bold: path.join(process.cwd(), 'src/assets/fonts/Roboto-Medium.ttf'),
    italics: path.join(process.cwd(), 'src/assets/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(process.cwd(), 'src/assets/fonts/Roboto-MediumItalic.ttf'),
  },
};

const COR = {
  primaria: '#0B2E8A',
  texto: '#1F2937',
  cinza: '#6B7280',
  borda: '#D1D5DB',
};

// chaves normalizadas (minúsculas, sem acento)
const COR_STATUS: Record<string, string> = {
  aberta: '#F9E2A0',
  'em andamento': '#DDEBF7',
  concluida: '#E2F0D9',
  cancelada: '#E7E6E6',
};

const COR_PRIORIDADE: Record<string, string> = {
  baixa: '#FFF2CC',
  media: '#C6D9F1',
  alta: '#FCE4D6',
  critica: '#F4CCCC',
};

export interface RelatorioFiltros {
  inicio?: Date | string;
  fim?: Date | string;
  ambiente?: string;
  status?: string;
  prioridade?: string;
  tecnico?: string;
}

export interface RankingItem {
  nome: string;
  total: number;
}

export interface RelatorioLinha {
  id: number;
  titulo?: string | null;
  status: string;
  prioridade: string;
  ambiente?: string | null;
  componente?: string | null;
  criadoPor?: string | null;
  tecnicos?: string | null;
  criadoEm?: Date | string | null;
  encerradoEm?: Date | string | null;
}

export interface RelatorioDados {
  geradoPor: { nome: string; perfil: string };
  filtros: RelatorioFiltros;
  resumo: {
    total: number;
    abertas: number;
    emAndamento: number;
    concluidas: number;
    canceladas: number;
    tempoMedioHoras: number | null;
  };
  porPrioridade?: Record<string, number>;
  rankings?: {
    ambientes?: RankingItem[];
    componentes?: RankingItem[];
    tecnicos?: RankingItem[]; // o service só envia para admin
  };
  linhas: RelatorioLinha[];
}

const norm = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const TZ = 'America/Sao_Paulo';

const dois = (n: number) => String(n).padStart(2, '0');

// O banco guarda a hora local (ex.: 22:30) e o Node a lê como UTC.
// Por isso a data é formatada em UTC, sem conversão de fuso.
const fmtData = (d?: Date | string | null) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '-';
  return `${dois(dt.getUTCDate())}/${dois(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`;
};

// Data e hora de abertura/encerramento da ocorrência
const fmtMomento = (d?: Date | string | null) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '-';
  return `${fmtData(dt)} ${dois(dt.getUTCHours())}:${dois(dt.getUTCMinutes())}`;
};

// "Gerado em" é o instante real de agora, então usa o fuso de Brasília.
const fmtDataHora = (d: Date) =>
  d.toLocaleString('pt-BR', { timeZone: TZ });

@Injectable()
export class PdfExporter {
  async gerar(dados: RelatorioDados) {
    const printer = new PdfPrinter(fonts);
    const agora = new Date();

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [30, 30, 30, 40],
      defaultStyle: { font: 'Roboto', fontSize: 9, color: COR.texto },
      styles: {
        titulo: { fontSize: 18, bold: true, color: COR.primaria },
        secao: { fontSize: 12, bold: true, color: COR.primaria, margin: [0, 14, 0, 6] },
        legenda: { fontSize: 8, color: COR.cinza },
      },
      footer: (paginaAtual, totalPaginas) => ({
        margin: [30, 10, 30, 0],
        columns: [
          { text: `N.O.S • Gerado em ${fmtDataHora(agora)}`, style: 'legenda' },
          { text: `Página ${paginaAtual} de ${totalPaginas}`, style: 'legenda', alignment: 'right' },
        ],
      }),
      content: [
        this.cabecalho(dados, agora),
        { text: 'Resumo', style: 'secao' },
        this.cardsResumo(dados),
        ...this.blocoPrioridade(dados),
        ...this.blocoRankings(dados),
        { text: 'Detalhamento das ocorrências', style: 'secao' },
        this.tabelaDetalhe(dados.linhas),
      ],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<{ buffer: Buffer; nomeArquivo: string; contentType: string }>(
      (resolve, reject) => {
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () =>
          resolve({
            buffer: Buffer.concat(chunks),
            nomeArquivo: `relatorio-ocorrencias-${agora.toLocaleDateString('en-CA', { timeZone: TZ })}.pdf`,
            contentType: 'application/pdf',
          }),
        );
        pdfDoc.on('error', reject);
        pdfDoc.end();
      },
    );
  }

  // ---------- Cabeçalho + filtros ----------
  private cabecalho(d: RelatorioDados, agora: Date): Content {
    const f = d.filtros;
    const periodo =
      f.inicio || f.fim ? `${fmtData(f.inicio)} a ${fmtData(f.fim)}` : 'Todo o período';

    const filtros = [
      `Período: ${periodo}`,
      `Ambiente: ${f.ambiente ?? 'Todos'}`,
      `Status: ${f.status ?? 'Todos'}`,
      `Prioridade: ${f.prioridade ?? 'Todas'}`,
      `Técnico: ${f.tecnico ?? 'Todos'}`,
    ].join('   |   ');

    return {
      stack: [
        {
          columns: [
            { image: logoDataUri, width: 90 },
            {
              width: '*',
              stack: [
                { text: 'Relatório de Ocorrências', style: 'titulo' },
                {
                  text: `Gerado em ${fmtDataHora(agora)} por ${d.geradoPor.nome} (${d.geradoPor.perfil})`,
                  style: 'legenda',
                  margin: [0, 2, 0, 0],
                },
              ],
              margin: [12, 14, 0, 0],
            },
          ],
        },
        { text: filtros, style: 'legenda', margin: [0, 8, 0, 0] },
      ],
    };
  }

  // ---------- Cards de resumo ----------
  private cardsResumo(d: RelatorioDados): Content {
    const r = d.resumo;
    const tempo =
      r.concluidas === 0 || r.tempoMedioHoras == null ? '—' : `${r.tempoMedioHoras.toFixed(1)} h`;

    const cards = [
      { rotulo: 'Total', valor: String(r.total) },
      { rotulo: 'Abertas', valor: String(r.abertas) },
      { rotulo: 'Em andamento', valor: String(r.emAndamento) },
      { rotulo: 'Concluídas', valor: String(r.concluidas) },
      { rotulo: 'Canceladas', valor: String(r.canceladas) },
      { rotulo: 'Tempo médio', valor: tempo },
    ];

    return {
      table: {
        widths: cards.map(() => '*'),
        body: [
          cards.map(
            (c): TableCell => ({
              stack: [
                { text: c.valor, fontSize: 18, bold: true, color: COR.primaria },
                { text: c.rotulo, style: 'legenda' },
              ],
              alignment: 'center',
              margin: [0, 6, 0, 6],
            }),
          ),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COR.borda,
        vLineColor: () => COR.borda,
      },
    };
  }

  private blocoPrioridade(d: RelatorioDados): Content[] {
    if (!d.porPrioridade) return [];
    const texto = Object.entries(d.porPrioridade)
      .map(([prioridade, qtd]) => `${prioridade}: ${qtd}`)
      .join('   •   ');
    return [{ text: `Por prioridade — ${texto}`, margin: [0, 6, 0, 0] }];
  }

  // ---------- Rankings ----------
  private blocoRankings(d: RelatorioDados): Content[] {
    const r = d.rankings;
    if (!r) return [];

    const colunas = [
      this.ranking('Ambientes com mais ocorrências', r.ambientes),
      this.ranking('Componentes com mais falhas', r.componentes),
      this.ranking('Técnicos com mais atendimentos', r.tecnicos),
    ].filter((c): c is Content => c !== null);

    if (!colunas.length) return [];

    return [
      { text: 'Análises', style: 'secao' },
      { columns: colunas, columnGap: 12 },
    ];
  }

  private ranking(titulo: string, itens?: RankingItem[]): Content | null {
    if (!itens) return null; // nem aparece (ex.: técnico não vê ranking de técnicos)
    const topo = itens.slice(0, 5);

    return {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: titulo, bold: true, color: '#FFFFFF', fillColor: COR.primaria, colSpan: 2 },
            {},
          ],
          ...(topo.length
            ? topo.map((i): TableCell[] => [i.nome, { text: String(i.total), alignment: 'right' }])
            : [[{ text: 'Sem dados', color: COR.cinza, colSpan: 2 }, {}] as TableCell[]]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => COR.borda,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
    };
  }

  // ---------- Detalhamento ----------
  private tabelaDetalhe(linhas: RelatorioLinha[]): Content {
    if (!linhas.length) {
      return { text: 'Nenhuma ocorrência encontrada para os filtros informados.', color: COR.cinza };
    }

    const cab = (t: string): TableCell => ({ text: t, bold: true, color: '#FFFFFF' });

    return {
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto','auto', 'auto', 'auto'],
        body: [
          [
            cab('Nº'), cab('Título'), cab('Status'), cab('Prioridade'),
            cab('Ambiente'), cab('Componente'), cab('Criado Por'), cab('Técnico(s) Atribuído(s)'),
            cab('Abertura'), cab('Encerramento'),
          ],
          ...linhas.map((l): TableCell[] => [
            String(l.id),
            l.titulo ?? '-',
            { text: l.status, fillColor: COR_STATUS[norm(l.status)] },
            { text: l.prioridade, fillColor: COR_PRIORIDADE[norm(l.prioridade)] },
            l.ambiente ?? '-',
            l.componente ?? '-',
            l.criadoPor ?? '-',
            l.tecnicos ?? '-',
            fmtMomento(l.criadoEm),
            fmtMomento(l.encerradoEm),
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => COR.borda,
        paddingTop: () => 4,
        paddingBottom: () => 4,
        fillColor: (row: number) => (row === 0 ? COR.primaria : null),
      },
    };
  }
}