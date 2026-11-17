import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateOcorrenciaDto, OcorrenciaStatus, OcorrenciaPrioridade } from "./dtos/createocorrenciaDto";
import { ocorrencias, Ambientes, Componentes, User } from "src/db/schemas";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { eq, sql, desc, like } from "drizzle-orm";



@Injectable()
export class OcorrenciaRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB,

    ) { }

    async listarOcorrencia() {
        return await this.consultaOcorrencia()
            .orderBy(desc(ocorrencias.criado_em));
    }

    async listarOcorrenciaPorId(id: number) {
        const ocorrencia = await this.consultaOcorrencia()
            .where(eq(ocorrencias.id_ocor, id));

        return ocorrencia[0];
    }

    async abrirOcorrencia(dto: CreateOcorrenciaDto, idUser: number) {
        const [resultado] = await this.db
            .insert(ocorrencias)
            .values({
                ocor_nome: dto.ocor_nome,
                ocor_prioridade: dto.ocor_prioridade,
                ocor_status: OcorrenciaStatus.ABERTA,
                ocor_obs: dto.ocor_obs,
                // Adicionando o campo ocor_tipo ao inserir uma nova ocorrência
                ocor_tipo: dto.ocor_tipo,
                componente_id: dto.componente_id,
                ambiente_id: dto.ambiente_id,
                id_user: idUser,
            });

        return this.verificaOcorrenciaExiste(Number(resultado.insertId));
    }

    async editarOcorrencia(id: number, updateDto: UpdateOcorrenciaDto) {
        await this.db
            .update(ocorrencias)
            .set({
                ...updateDto
            })
            .where(eq(ocorrencias.id_ocor, id))
    }

    // Método para alterar o status da ocorrência
    async alterarStatus(id: number, novoStatus: OcorrenciaStatus) {
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
    }


    async alterarPrioridade(id: number, prioridade: OcorrenciaPrioridade) {
        await this.db
            .update(ocorrencias)
            .set({
                ocor_prioridade: prioridade,
            })
            .where(eq(ocorrencias.id_ocor, id));
    }


    async adicionarObservacao(id: number, obs: string) {
        await this.db
            .update(ocorrencias)
            .set({
                ocor_obs: obs
            })
            .where(eq(ocorrencias.id_ocor, id));
    }

    async associarComponente(id: number, idComp: number) {
        await this.db
            .update(ocorrencias)
            .set({
                componente_id: idComp,
            })
            .where(eq(ocorrencias.id_ocor, id));
    }

    async associarAmbiente(id: number, idAmb: number) {
        await this.db
            .update(ocorrencias)
            .set({
                ambiente_id: idAmb,
            })
            .where(eq(ocorrencias.id_ocor, id));
    }


    // ##### Filtros de Ocorrências #####

    async filtrarPorStatus(status: OcorrenciaStatus) {
        return await this.consultaOcorrencia()
            .where(
                eq(ocorrencias.ocor_status, status)
            )
            .orderBy(
                desc(ocorrencias.criado_em)
            );
    }

    async filtrarPorPrioridade(prioridade: OcorrenciaPrioridade) {
        return await this.consultaOcorrencia()
            .where(
                eq(ocorrencias.ocor_prioridade, prioridade)
            )
            .orderBy(
                desc(ocorrencias.criado_em)
            );
    }

    async filtrarPorPeriodo(dataInicio: string, dataFim: string) {
        return await this.consultaOcorrencia()
            .where(
                sql`
                    DATE(${ocorrencias.criado_em})
                    BETWEEN ${dataInicio}
                    AND ${dataFim}
                `
            )
            .orderBy(
                desc(ocorrencias.criado_em)
            );
    }

    async filtrarPorAmbiente(nomeAmb: string) {
        return await this.consultaOcorrencia()
            .where(
                like(Ambientes.amb_nome, `%${nomeAmb}%`)
            )
            .orderBy(desc(ocorrencias.criado_em));
    }

    async filtrarPorComponente(nomeComp: string) {
        return await this.consultaOcorrencia()
            .where(
                like(Componentes.compo_nome, `%${nomeComp}%`)
            )
            .orderBy(desc(ocorrencias.criado_em));
    }

    async filtrarPorNome(nomeOcor: string) {
        return await this.consultaOcorrencia()
            .where(
                like(ocorrencias.ocor_nome, `%${nomeOcor}%`)
            )
            .orderBy(desc(ocorrencias.criado_em));
    }


    // ##### Reutilizações #####

    private selecionarOcorrencia() {
        return {
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
            criado_por: {
                id_user: User.id_user,
                user_nome: User.user_nome,
            }
        };
    }

    private consultaOcorrencia() {
        return this.db
            .select(
                this.selecionarOcorrencia()
            )
            .from(ocorrencias)
            .leftJoin(
                Componentes,
                eq(ocorrencias.componente_id, Componentes.id_compo)
            )
            .leftJoin(
                Ambientes,
                eq(ocorrencias.ambiente_id, Ambientes.id_amb)
            )
            .leftJoin(
                User,
                eq(ocorrencias.id_user, User.id_user)
            );
    }

    // ##### Métodos de validação #####

    // Método de verificar se a ocorrência existe
    async verificaOcorrenciaExiste(id: number) {
        const [ocorrencia] = await this.db
            .select()
            .from(ocorrencias)
            .where(eq(ocorrencias.id_ocor, id));

        return ocorrencia;
    }
}