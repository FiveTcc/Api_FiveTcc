import { Injectable } from "@nestjs/common";
import { OcorrenciaRepository } from "./ocorrencia.repository";
import { CreateOcorrenciaDto, OcorrenciaStatus } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";

@Injectable()
export class OcorrenciaService {
    constructor(private readonly ocorrenciaRepository: OcorrenciaRepository) { }

     // Método para listar ocorrência
    async listarOcorrencia() {
        return await this.ocorrenciaRepository.listarOcorrencia();
    }

    // Método para criar ocorrência
    async criarOcorrencia(dto: CreateOcorrenciaDto) {
        return await this.ocorrenciaRepository.criarOcorrencia(dto);
    }

    // Método para editar ocorrência
    async editarOcorrencia(id: number, dto: UpdateOcorrenciaDto) {
        return await this.ocorrenciaRepository.editarOcorrencia(id, dto);
    }

    // Método para encerrar ocorrência
    async encerrarOcorrencia(id: number) {
        return await this.ocorrenciaRepository.encerrarOcorrencia(id);
    }

    // Método para cancelar ocorrência
    async cancelarOcorrencia(id: number) {
        return await this.ocorrenciaRepository.cancelarOcorrencia(id);
    }

    // Método para alterar prioridade da ocorrência
    async alterarPrioridade() {
        return await this.ocorrenciaRepository.alterarPrioridade();
    }

    // Método para alterar status da ocorrência
    async alterarStatus(
        id: number,
        novoStatus: OcorrenciaStatus
    ) {
        return await this.ocorrenciaRepository.alterarStatus(id, novoStatus);
    }

    // Método para adicionar observação a ocorrência
    async adicionarObservação() {
        return await this.ocorrenciaRepository.adicionarObservacao();
    }

    // Método para associar componente a ocorrência
    async associarComponente() {
        return await this.ocorrenciaRepository.associarComponente();
    }

    // Método para associar ambiente a ocorrência
    async associarAmbiente() {
        return await this.ocorrenciaRepository.associarAmbiente();
    }

    // Método para atribuir ocorrência ao tecnico
    async atribuirTecnico() {
        return await this.ocorrenciaRepository.atribuirTecnico();
    }

    // Histórico de ocorrências
    async historicoDeOcorrencia() {
       return await this.ocorrenciaRepository.historicoDeOcorrencia() 
    }
}