import { Injectable } from "@nestjs/common";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";

@Injectable()
export class AtribuicaoTecnicoService {
    constructor(private readonly atribuicaoTecnicoRepository: AtribuicaoTecnicoRepository) { }


    // async vincularTecnico(id_ocor: number, dto: any) {
    //     // Lógica para vincular técnico a uma ocorrência
    //     return this.atribuicaoTecnicoRepository.vincularTecnico(id_ocor, dto);
    // }

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