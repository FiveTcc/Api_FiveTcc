import { Injectable } from "@nestjs/common";
import { AuditoriaRepository } from "./auditoria.repository";

@Injectable()
export class AuditoriaService {
    constructor(private readonly auditoriaRepository: AuditoriaRepository) { }

}