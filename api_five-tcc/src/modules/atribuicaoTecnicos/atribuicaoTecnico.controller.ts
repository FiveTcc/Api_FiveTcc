import { Controller } from "@nestjs/common";
import { AtribuicaoTecnicoService } from "./atribuicaoTecnico.service"

@Controller('atribuicao-tecnico')
export class AtribuicaoTecnicoController {
    constructor(private readonly atribuicaoTecnicoService: AtribuicaoTecnicoService) {}

}