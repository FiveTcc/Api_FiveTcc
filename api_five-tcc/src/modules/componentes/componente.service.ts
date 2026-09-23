import { Injectable } from "@nestjs/common";
import { ComponenteRepository } from "./componente.repository";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";

@Injectable()
export class ComponenteService {
    constructor(private readonly componenteRepository: ComponenteRepository) { }

    // Método para listar todos os componentes
    async listarComponente() {
        return await this.componenteRepository.listarComponente();
    }

    // Método para listar todos os componentes por id
    async listarComponenteId(id: number) {
        return await this.componenteRepository.listarComponenteId(id);
    }

    // Método para criar componente
    async cadastrarComponente(CreateComponenteDto: CreateComponenteDto) {
        return await this.componenteRepository.cadastrarComponente(CreateComponenteDto)
    }

    // Método para atualizar componente
    async atualizarComponente(id: number, UpdateComponenteDto: UpdateComponenteDto) {
        return await this.componenteRepository.atualizarComponente(id, UpdateComponenteDto)
    }

    // Método para excluir componente
    async excluirComponente(id: number) {
        return await this.componenteRepository.excluirComponente(id)
    }

    // Método para atualizar status do componente
    async atualizarStatusComponente(id: number) {
        return await this.componenteRepository.atualizarStatusComponente(id)
    }

    // Método para associar componente a um ambiente
    async associarCompAmb(id: number, idAmb: number) {
        return await this.componenteRepository.associarCompAmb(id, idAmb)
    }

    // // Método para alterar tipo de componente
    // async alterarTipoComponente(id: number, compoTipoId: number) {
    //     return await this.componenteRepository.alterarTipoComponente(id, compoTipoId)
    // }

    // ##### Filtros #####

    // Método para filtrar componentes por ambiente
    async filtrarPorAmbiente(nomeAmb: string) {
       return await this.componenteRepository.filtrarPorAmbiente(nomeAmb) 
    }

    // Método para filtrar componentes por tipo
    async filtrarPorTipo(tipo: string) {
       return await this.componenteRepository.filtrarPorTipo(tipo) 
    }

    // Método para filtrar componentes por nome
    async filtrarPorNome(nome: string) {
        return await this.componenteRepository.filtrarPorNome(nome)
    }
}