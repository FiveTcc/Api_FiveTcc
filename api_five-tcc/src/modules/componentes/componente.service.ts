import { Injectable } from "@nestjs/common";
import { ComponenteRepository } from "./componente.repository";

@Injectable()
export class ComponenteService {
    constructor(private readonly componenteRepository: ComponenteRepository) { }

    // Método para listar todos os componentes
    async ListarComponente() {
        return await this.componenteRepository.ListarComponente();
    }

    // Método para listar todos os componentes por id
    async ListarComponenteId(id: number) {
        return await this.componenteRepository.ListarComponenteId(id);
    }

    // Método para criar componente
    async CadastrarComponente(bodyRequest: any) {
        return await this.componenteRepository.CadastrarComponente(bodyRequest)
    }
}