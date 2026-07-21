import { Injectable } from "@nestjs/common";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";

@Injectable()
export class AtribuicaoTecnicoService {
    constructor(private readonly atribuicaoTecnicoRepository: AtribuicaoTecnicoRepository) { }

}