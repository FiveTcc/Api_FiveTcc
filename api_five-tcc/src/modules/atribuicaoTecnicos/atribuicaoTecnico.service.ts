import { Injectable } from "@nestjs/common";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";
import { AtribuirTecnicoDto } from "./dtos/atribuirTecnicoDtos";

@Injectable()
export class AtribuicaoTecnicoService {
    constructor(private readonly atribuicaoTecnicoRepository: AtribuicaoTecnicoRepository) { }


    async vincularTecnico(idOcor: number, dto: AtribuirTecnicoDto) {
        // Lógica para vincular técnico a uma ocorrência
        return this.atribuicaoTecnicoRepository.vincularTecnico(idOcor, dto);
    }

    // async atualizarAtribuicao(id_ocor: number, id_user: number, dto: any) {
    //     // Lógica para atualizar a atribuição de um técnico a uma ocorrência
    //     return this.atribuicaoTecnicoRepository.atualizarAtribuicao(id_ocor, id_user, dto);
    // }

    // async removerTecnico(id_ocor: number, id_user: number) {
    //     // Lógica para remover um técnico de uma ocorrência
    //     return this.atribuicaoTecnicoRepository.removerTecnico(id_ocor, id_user);
    // }

    // async listarTecnicos(id_ocor: number) {
    //     // Lógica para listar técnicos atribuídos a uma ocorrência
    //     return this.atribuicaoTecnicoRepository.listarTecnicos(id_ocor);
    // }

}