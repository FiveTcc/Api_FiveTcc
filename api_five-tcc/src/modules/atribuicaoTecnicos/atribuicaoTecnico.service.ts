import { Injectable } from "@nestjs/common";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";
import { AtribuirTecnicoDto } from "./dtos/atribuirTecnicoDtos";

@Injectable()
export class AtribuicaoTecnicoService {
    constructor(private readonly atribuicaoTecnicoRepository: AtribuicaoTecnicoRepository) { }


    async vincularTecnico(idOcor: number, dto: AtribuirTecnicoDto) {    
        return this.atribuicaoTecnicoRepository.vincularTecnico(idOcor, dto);
    }

    async listarTecnicoDaOcorrencia(idOcor: number) {
        return this.atribuicaoTecnicoRepository.listarTecnicoDaOcorrencia(idOcor);
    }

    
    async listarOcorrenciaDoTecnico(idUser: number) {
        return this.atribuicaoTecnicoRepository.listarOcorrenciaDoTecnico(idUser);
    }

}