import { Injectable } from "@nestjs/common";
import { OcorrenciaRepository } from "./ocorrencia.repository";
import { CreateOcorrenciaDto, OcorrenciaStatus, OcorrenciaPrioridade } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";

@Injectable()
export class OcorrenciaService {
    constructor(private readonly ocorrenciaRepository: OcorrenciaRepository) { }

    // Método para listar ocorrência
    async listarOcorrencia() {
        return await this.ocorrenciaRepository.listarOcorrencia();
    }

    // Método para listar ocorrência por id
    async listarOcorrenciaId(id: number) {
        return await this.ocorrenciaRepository.listarOcorrenciaId(id);
    }

    // Método para criar ocorrência
    async abrirOcorrencia(dto: CreateOcorrenciaDto) {
        return await this.ocorrenciaRepository.abrirOcorrencia(dto);
    }

    // Método para editar ocorrência
    async editarOcorrencia(id: number, updateDto: UpdateOcorrenciaDto) {
        return await this.ocorrenciaRepository.editarOcorrencia(id, updateDto);
    }

    // Método para encerrar ocorrência
    async encerrarOcorrencia(id: number) {
        return await this.ocorrenciaRepository.encerrarOcorrencia(id);
    }

    // Método para cancelar ocorrência
    async cancelarOcorrencia(id: number) {
        return await this.ocorrenciaRepository.cancelarOcorrencia(id);
    }

    // Método para alterar status da ocorrência
    async alterarStatus(
        id: number,
        novoStatus: OcorrenciaStatus
    ) {
        return await this.ocorrenciaRepository.alterarStatus(id, novoStatus);
    }

    // Método para alterar prioridade da ocorrência
    async alterarPrioridade(
        id: number,
        prioridade: OcorrenciaPrioridade
    ) {
        return await this.ocorrenciaRepository.alterarPrioridade(id, prioridade);
    }

    // Método para adicionar observação a ocorrência
    async adicionarObservação(
        id: number,
        obs: string
    ) {
        return await this.ocorrenciaRepository.adicionarObservacao(id, obs);
    }

    // Método para associar componente a ocorrência
    async associarComponente(
        id: number,
        idComp: number
    ) {
        return await this.ocorrenciaRepository.associarComponente(id, idComp);
    }

    // Método para associar ambiente a ocorrência
    async associarAmbiente(
        id: number,
        idAmb: number
    ) {
        return await this.ocorrenciaRepository.associarAmbiente(id, idAmb);
    }

    // // Histórico de ocorrências
    // async historicoDeOcorrencia() {
    //    return await this.ocorrenciaRepository.historicoDeOcorrencia() 
    // }


    // ##### Filtros de Ocorrências #####

     // Filtro por nome
    async filtrarPorNome(nomeOcor: string) {
        return await this.ocorrenciaRepository.filtrarPorNome(nomeOcor);
    }

    // Filtro por ambiente
    async filtrarPorAmbiente(nomeAmb: string) {
        return await this.ocorrenciaRepository.filtrarPorAmbiente(nomeAmb);
    }

    // Filtro por componente
    async filtrarPorComponente(nomeComp: string) {
        return await this.ocorrenciaRepository.filtrarPorComponente(nomeComp);
    }

    // Filtro por status
    async filtrarPorStatus(status: OcorrenciaStatus) {
        return await this.ocorrenciaRepository.filtrarPorStatus(status);
    }

    // Filtro por status
    async filtrarPorPrioridade(prioridade: OcorrenciaPrioridade) {
        return await this.ocorrenciaRepository.filtrarPorPrioridade(prioridade);
    }

    // Filtro por status
    async filtrarPorPeriodo(dataInicio: string, dataFim: string) {
        return await this.ocorrenciaRepository.filtrarPorPeriodo(dataInicio, dataFim);
    }
}