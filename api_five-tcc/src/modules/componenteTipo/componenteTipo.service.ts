import { Injectable } from "@nestjs/common";
import { ComponenteTipoRepository } from "./componenteTipo.repository";
import { CreateComponenteTipoDto } from "./dtos/create.componenteTipoDto";
import { UpdateComponenteTipoDto } from "./dtos/update.componenteTipoDto";

@Injectable()
export class ComponenteTipoService {
    constructor(private readonly componenteTipoRepository: ComponenteTipoRepository) {}

    // Método para listar todos os tipos de componentes
    async listarComponenteTipo() {
        return await this.componenteTipoRepository.listarComponenteTipo();
    }

    // Método para listar tipo de componente por ID
    async listarComponenteTipoId(id: number) {
        return await this.componenteTipoRepository.listarComponenteTipoId(id);
    }

    // Método para cadastrar tipo de componente
    async cadastrarComponenteTipo(CreateComponenteTipoDto: CreateComponenteTipoDto) {
        return await this.componenteTipoRepository.cadastrarComponenteTipo(CreateComponenteTipoDto);
    }

    // Método para atualizar tipo de componente
    async atualizarComponenteTipo(id: number, UpdateComponenteTipoDto: UpdateComponenteTipoDto) {
        return await this.componenteTipoRepository.atualizarComponenteTipo(id, UpdateComponenteTipoDto);
    }

    // Método para excluir tipo de componente
    async excluirComponenteTipo(id: number) {
        return await this.componenteTipoRepository.excluirComponenteTipo(id);
    }
}