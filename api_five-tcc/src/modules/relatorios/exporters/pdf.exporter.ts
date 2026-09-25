import { Injectable } from '@nestjs/common';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as path from 'path';

const PdfPrinter = require('pdfmake/src/printer');

const fonts = {
  Roboto: {
    normal: path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf'),
    bold: path.join(process.cwd(), 'src/assets/fonts/Roboto-Medium.ttf'),
    italics: path.join(process.cwd(), 'src/assets/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(process.cwd(), 'src/assets/fonts/Roboto-MediumItalic.ttf'),
  },
};

@Injectable()
export class PdfExporter {
  async gerar(dados: {
    filtros: any;
    resumo: { total: number; abertas: number; concluidas: number; tempoMedioHoras: number };
    agrupamento?: any[];
    linhas: any[];
  }) {
    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Relatório de Ocorrências', style: 'titulo' },
        {
          text: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
          style: 'subtitulo',
        },
        { text: 'Resumo', style: 'secao', margin: [0, 15, 0, 5] },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Total de ocorrências', String(dados.resumo.total)],
              ['Abertas', String(dados.resumo.abertas)],
              ['Concluídas', String(dados.resumo.concluidas)],
              ['Tempo médio de atendimento (h)', String(dados.resumo.tempoMedioHoras)],
            ],
          },
        },
        { text: 'Ocorrências', style: 'secao', margin: [0, 15, 0, 5] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*', '*'],
            body: [
              ['ID', 'Status', 'Prioridade', 'Ambiente', 'Componente'],
              ...dados.linhas.map((l) => [
                String(l.id),
                l.status,
                l.prioridade,
                l.ambiente ?? '-',
                l.componente ?? '-',
              ]),
            ],
          },
        },
      ],
      styles: {
        titulo: { fontSize: 18, bold: true },
        subtitulo: { fontSize: 10, color: 'gray', margin: [0, 0, 0, 10] },
        secao: { fontSize: 14, bold: true },
      },
      defaultStyle: { fontSize: 9 },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<{ buffer: Buffer; nomeArquivo: string; contentType: string }>(
      (resolve, reject) => {
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => {
          resolve({
            buffer: Buffer.concat(chunks),
            nomeArquivo: `relatorio-ocorrencias-${Date.now()}.pdf`,
            contentType: 'application/pdf',
          });
        });
        pdfDoc.on('error', reject);
        pdfDoc.end();
      },
    );
  }
}