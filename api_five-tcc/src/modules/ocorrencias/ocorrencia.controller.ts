import { Controller } from "@nestjs/common";
import { OcorrenciaService } from "./ocorrencia.service"

@Controller('ocorrencias')
export class OcorrenciaController {
    constructor(private readonly ocorrenciaService: OcorrenciaService) { }

}