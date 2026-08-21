import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateOcorrenciaDto, OcorrenciaStatus } from "./dtos/createocorrenciaDto";
import { ocorrencias, Ambientes, Componentes } from "src/db/schemas";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { eq, sql, desc } from "drizzle-orm";
import { ComponenteRepository } from "../componentes/componente.repository";
import { AmbienteRepository } from "../ambientes/ambiente.repository";

@Injectable()
export class OcorrenciaRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly componenteRepository: ComponenteRepository,
        private readonly ambienteRepository: AmbienteRepository
    ) { }

    async listarOcorrencia() {
        try {

            return await this.db
                .select({
                    ocorrencia: {
                        id_ocor: ocorrencias.id_ocor,
                        ocor_nome: ocorrencias.ocor_nome,
                        ocor_status: ocorrencias.ocor_status,
                        ocor_prioridade: ocorrencias.ocor_prioridade,
                        ocor_obs: ocorrencias.ocor_obs,
                        criado_em: ocorrencias.criado_em,
                        atualizado_em: ocorrencias.atualizado_em,
                        encerrado_em: ocorrencias.encerrado_em,
                    },

                    componente: {
                        id_compo: Componentes.id_compo,
                        compo_nome: Componentes.compo_nome,
                        compo_tipo_id: Componentes.compo_tipo_id,
                    },

                    ambiente: {
                        id_amb: Ambientes.id_amb,
                        amb_nome: Ambientes.amb_nome,
                        amb_tipo: Ambientes.amb_tipo,
                        amb_bloco: Ambientes.amb_bloco,
                        amb_andar: Ambientes.amb_andar,
                    },
                })
                .from(ocorrencias)
                .leftJoin(
                    Componentes,
                    eq(ocorrencias.componente_id,
                        Componentes.id_compo
                    ))
                .leftJoin(
                    Ambientes,
                    eq(ocorrencias.ambiente_id,
                        Ambientes.id_amb
                    )
                )
                .orderBy(desc(ocorrencias.criado_em));

        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao listar ocorrências'
            );
        }
    }

    async listarOcorrenciaId(id: number) {
        try {
            const ocorrencia = await this.db
                .select({
                    ocorrencia: {
                        id_ocor: ocorrencias.id_ocor,
                        ocor_nome: ocorrencias.ocor_nome,
                        ocor_status: ocorrencias.ocor_status,
                        ocor_prioridade: ocorrencias.ocor_prioridade,
                        ocor_obs: ocorrencias.ocor_obs,
                        criado_em: ocorrencias.criado_em,
                        atualizado_em: ocorrencias.atualizado_em,
                        encerrado_em: ocorrencias.encerrado_em,
                    },

                    componente: {
                        id_compo: Componentes.id_compo,
                        compo_nome: Componentes.compo_nome,
                        compo_tipo_id: Componentes.compo_tipo_id,
                    },

                    ambiente: {
                        id_amb: Ambientes.id_amb,
                        amb_nome: Ambientes.amb_nome,
                        amb_tipo: Ambientes.amb_tipo,
                        amb_bloco: Ambientes.amb_bloco,
                        amb_andar: Ambientes.amb_andar,
                    },
                })
                .from(ocorrencias)
                .leftJoin(
                    Componentes,
                    eq(ocorrencias.componente_id,
                        Componentes.id_compo
                    ))
                .leftJoin(
                    Ambientes,
                    eq(ocorrencias.ambiente_id,
                        Ambientes.id_amb
                    )
                )
                .where(
                    eq(ocorrencias.id_ocor, id)
                );

            if (ocorrencia.length === 0) {
                throw new NotFoundException(
                    'Ocorrência não encontrada'
                );
            }

            return ocorrencia[0];


        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao listar ocorrência'
            );
        }
    }


    async criarOcorrencia(dto: CreateOcorrenciaDto) {
        try {

            await this.db
                .insert(ocorrencias)
                .values({
                    ocor_nome: dto.ocor_nome,
                    ocor_prioridade: dto.ocor_prioridade,
                    ocor_status: OcorrenciaStatus.ABERTA,
                    ocor_obs: dto.ocor_obs,
                    componente_id: dto.componente_id,
                    ambiente_id: dto.ambiente_id,
                });

            return {
                message: `Ocorrencia criada com sucesso`
            }
        } catch (error) {

            throw new InternalServerErrorException(
                'Erro ao criar ocorrência'
            );
        }
    }

    async editarOcorrencia(id: number, dto: UpdateOcorrenciaDto) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);

            this.validarAlteracao(
                ocorrencia.ocor_status as OcorrenciaStatus,
            );

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
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao editar ocorrência');
        }

    }


    async cancelarOcorrencia(id: number) {
        return this.alterarStatus(
            id,
            OcorrenciaStatus.CANCELADA
        );
    }

    async encerrarOcorrencia(id: number) {
        return this.alterarStatus(
            id,
            OcorrenciaStatus.CONCLUIDA
        );
    }


    // Método para alterar o status da ocorrência
    async alterarStatus(
        id: number,
        novoStatus: OcorrenciaStatus
    ) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);

            this.validarTransicao(
                ocorrencia.ocor_status as OcorrenciaStatus,
                novoStatus
            );

            await this.db
                .update(ocorrencias)
                .set({
                    ocor_status: novoStatus,
                    encerrado_em:
                        novoStatus === OcorrenciaStatus.CONCLUIDA ||
                            novoStatus === OcorrenciaStatus.CANCELADA
                            ? sql`CURRENT_TIMESTAMP`
                            : null,
                })
                .where(
                    eq(ocorrencias.id_ocor, id)
                );

            return {
                message: 'Status da ocorrência alterado com sucesso'
            }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Erro ao alterar status da ocorrência'
            );
        }

    }


    async alterarPrioridade() {
        try {

        } catch (error) {

        }
    }


    async adicionarObservacao(
        id: number,
        obs: string
    ) {
        try {

            // Verifica se a ocorrência existe
            const ocorrencia = await this.verificaOcorrenciaExiste(id);

            this.validarAlteracao(
                ocorrencia.ocor_status as OcorrenciaStatus,
            );

            await this.db
                .update(ocorrencias)
                .set({
                    ocor_obs: obs
                })
                .where(eq(ocorrencias.id_ocor, id));

            return {
                message: 'Observação adicionada com sucesso'
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao adicionar observação'
            );
        }
    }

    async associarComponente(id: number, idComp: number) {
        try {

            // Verifica se a ocorrência existe
            const ocorrencia = await this.verificaOcorrenciaExiste(id);

            // Verifica se ocorrência não está Concluida ou Cancelada
            this.validarAlteracao(
                ocorrencia.ocor_status as OcorrenciaStatus,
            );


            // Verifica se o componente existe
            await this.componenteRepository.verificaComponenteExiste(idComp);

            await this.db
                .update(ocorrencias)
                .set({
                    componente_id: idComp,
                })
                .where(eq(ocorrencias.id_ocor, id));

            return {
                message: 'Componente associado com sucesso'
            }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Erro ao associar componente a ocorrência',
            );
        }
    }

    async associarAmbiente(id: number, idAmb: number) {
        try {
            // Verifica se a ocorrência existe
            const ocorrencia = await this.verificaOcorrenciaExiste(id);

            // Verifica se ocorrência não está Concluida ou Cancelada
            this.validarAlteracao(
                ocorrencia.ocor_status as OcorrenciaStatus,
            );

            // Verifica se ambiente existe
            await this.ambienteRepository.verificaAmbienteExiste(idAmb);


            await this.db
                .update(ocorrencias)
                .set({
                    ambiente_id: idAmb,
                })
                .where(eq(ocorrencias.id_ocor, id));

            return {
                message: 'Ambiente associado com sucesso'
            }

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao associar ambiente a ocorrência',
            );
        }

    }

    // async historicoDeOcorrencia() { }


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

    private validarAlteracao(status: OcorrenciaStatus) {
        const statusFinais = [
            OcorrenciaStatus.CONCLUIDA,
            OcorrenciaStatus.CANCELADA,
        ];

        if (statusFinais.includes(status)) {
            throw new BadRequestException(
                `Não é possível editar uma ocorrência com status "${status}"`,
            );
        }
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
                OcorrenciaStatus.CONCLUIDA,
                OcorrenciaStatus.CANCELADA,
            ],

            [OcorrenciaStatus.CONCLUIDA]: [],

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