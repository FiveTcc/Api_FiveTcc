import { Controller } from "@nestjs/common";
import { RelatorioService } from "./relatorio.service"

@Controller('Relatorios')
export class RelatorioController {
    constructor(private readonly relatorioService: RelatorioService) { }

}