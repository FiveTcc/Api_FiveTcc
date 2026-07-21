import { Injectable } from "@nestjs/common";
import { OcorrenciaRepository } from "./ocorrencia.repository";

@Injectable()
export class OcorrenciaService {
    constructor(private readonly ocorrenciaRepository: OcorrenciaRepository) { }

}