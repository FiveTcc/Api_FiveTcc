import { Controller } from "@nestjs/common";
import { AuditoriaService } from "./auditoria.service"

@Controller('Auditoria')
export class AuditoriaController {
    constructor(private readonly auditoriaService: AuditoriaService) { }

}