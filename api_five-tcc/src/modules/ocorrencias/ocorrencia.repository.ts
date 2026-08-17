import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateOcorrenciaDto, OcorrenciaStatus } from "./dtos/createocorrenciaDto";
import { ocorrencias } from "src/db/schemas";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { eq } from "drizzle-orm";

@Injectable()
export class OcorrenciaRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

    async listarOcorrencia() {
        try {
            return await this.db
                .select()
                .from(ocorrencias);

        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar ocorrencias')
        }
    }

    async criarOcorrencia(dto: CreateOcorrenciaDto) {
        try {
            const [ocorrencia] = await this.db
                .insert(ocorrencias)
                .values({
                    ocor_nome: dto.ocor_nome,
                    ocor_prioridade: dto.ocor_prioridade,
                    ocor_status: dto.ocor_status,
                    ocor_obs: dto.ocor_obs,
                    componente_id: dto.componente_id,
                    ambiente_id: dto.ambiente_id,
                });

            return {
                message: `Ocorrencia criada com sucesso`
            }
        } catch (error) {
            throw new InternalServerErrorException('Erro ao criar ocorrência');
        }
    }

    async editarOcorrencia(id: number, dto: UpdateOcorrenciaDto) {
        try {
            await this.verificaOcorrenciaExiste(id);

            await this.db
                .update(ocorrencias)
                .set({
                    ...dto
                })
                .where(eq(ocorrencias.id_ocor, id))

            return {
                message: `Ocorrência editada com sucesso`
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao editar ocorrência');
        }

    }

    async encerrarOcorrencia(id: number) {
        try {
            await this.alterarStatus(
                id,
                OcorrenciaStatus.ENCERRADA
            );

            return {
                message: 'Ocorrência encerrada com sucesso'
            };
        } catch (error) {

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Erro ao encerrar ocorrência'
            );
        }
    }


    async cancelarOcorrencia(id: number) {
        try {
            await this.alterarStatus(
                id,
                OcorrenciaStatus.CANCELADA
            );

            return {
                message: 'Ocorrência cancelada com sucesso'
            }

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Erro ao cancelar ocorrência'
            );
        }
    }

    async alterarPrioridade() {
        try {

        } catch (error) {

        }
    }

    // Método para alterar o status da ocorrência
    async alterarStatus(
        id: number,
        novoStatus: OcorrenciaStatus
    ) {
        const ocorrencia = await this.verificaOcorrenciaExiste(id);

        this.validarTransicao(
            ocorrencia.ocor_status as OcorrenciaStatus,
            novoStatus
        );

        await this.db
            .update(ocorrencias)
            .set({
                ocor_status: novoStatus,
            })
            .where(
                eq(ocorrencias.id_ocor, id)
            );

            return {
                message: 'Status da ocorrência alterado com sucesso'
            }
    }

    async adicionarObservacao() { }

    async associarComponente() { }

    async associarAmbiente() { }

    async atribuirTecnico() { }

    async historicoDeOcorrencia() { }






    // Método de verificar se a ocorrência existe
    async verificaOcorrenciaExiste(id: number) {

        const [ocorrencia] = await this.db
            .select()
            .from(ocorrencias)
            .where(eq(ocorrencias.id_ocor, id));


        if (!ocorrencia) {
            throw new NotFoundException(
                'Ocorrência não encontrada'
            );
        }

        return ocorrencia;
    }

    // Método para validar a transição de status
   private validarTransicao(
        statusAtual: OcorrenciaStatus,
        novoStatus: OcorrenciaStatus
    ) {
        const transicoesPermitidas: Record<
            OcorrenciaStatus,
            OcorrenciaStatus[]
        > = {
            [OcorrenciaStatus.ABERTA]: [
                OcorrenciaStatus.EM_ANDAMENTO,
                OcorrenciaStatus.CANCELADA,
            ],

            [OcorrenciaStatus.EM_ANDAMENTO]: [
                OcorrenciaStatus.ENCERRADA,
                OcorrenciaStatus.CANCELADA,
            ],

            [OcorrenciaStatus.ENCERRADA]: [],

            [OcorrenciaStatus.CANCELADA]: [],
        };

        const permitidas = transicoesPermitidas[statusAtual];

        if (!permitidas.includes(novoStatus)) {
            throw new BadRequestException(
                `Não é possível alterar a ocorrência de "${statusAtual}" para "${novoStatus}"`
            );
        }
    }
}