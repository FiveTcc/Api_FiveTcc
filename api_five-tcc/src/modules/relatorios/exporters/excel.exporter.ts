import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExporter {
  async gerar(dados: {
    filtros: any;
    resumo: { total: number; abertas: number; concluidas: number; tempoMedioHoras: number };
    agrupamento?: any[];
    linhas: any[];
  }) {
    const workbook = new ExcelJS.Workbook();

    // Aba de resumo
    const abaResumo = workbook.addWorksheet('Resumo');
    abaResumo.addRow(['Total de ocorrências', dados.resumo.total]);
    abaResumo.addRow(['Abertas', dados.resumo.abertas]);
    abaResumo.addRow(['Concluídas', dados.resumo.concluidas]);
    abaResumo.addRow(['Tempo médio de atendimento (h)', dados.resumo.tempoMedioHoras]);
    abaResumo.getColumn(1).width = 35;

    // Aba de ocorrências
    const abaOcorrencias = workbook.addWorksheet('Ocorrências');
    abaOcorrencias.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Prioridade', key: 'prioridade', width: 12 },
      { header: 'Ambiente', key: 'ambiente', width: 20 },
      { header: 'Bloco', key: 'bloco', width: 10 },
      { header: 'Componente', key: 'componente', width: 20 },
      { header: 'Solicitante', key: 'solicitante', width: 20 },
      { header: 'Técnico(s)', key: 'tecnicos', width: 25 },
      { header: 'Criado em', key: 'criadoEm', width: 18 },
      { header: 'Encerrado em', key: 'encerradoEm', width: 18 },
    ];
    abaOcorrencias.getRow(1).font = { bold: true };
    dados.linhas.forEach((linha) => abaOcorrencias.addRow(linha));

    // Aba de agrupamento, se houver
    if (dados.agrupamento?.length) {
      const abaAgrupamento = workbook.addWorksheet('Agrupamento');
      const chaves = Object.keys(dados.agrupamento[0]);
      abaAgrupamento.addRow(chaves);
      abaAgrupamento.getRow(1).font = { bold: true };
      dados.agrupamento.forEach((item) => abaAgrupamento.addRow(Object.values(item)));
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      nomeArquivo: `relatorio-ocorrencias-${Date.now()}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}