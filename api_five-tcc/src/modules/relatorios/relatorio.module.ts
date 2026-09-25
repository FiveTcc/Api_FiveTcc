import { Module } from "@nestjs/common";
import { RelatorioController } from "./relatorio.controller";
import { RelatorioService } from "./relatorio.service";
import { RelatorioRepository } from "./relatorio.repository";
import { ExcelExporter } from "./exporters/excel.exporter";
import { PdfExporter } from "./exporters/pdf.exporter";


@Module({
    controllers: [RelatorioController],
    providers: [RelatorioService, RelatorioRepository, ExcelExporter, PdfExporter],
    imports: [],
})
export class RelatorioModule { }