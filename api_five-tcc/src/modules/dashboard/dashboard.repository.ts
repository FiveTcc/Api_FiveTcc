import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql, type SQL } from 'drizzle-orm';

import { DRIZZLE } from 'src/db/database/database.constants';

import {
    Ambientes,
    Componentes,
    ocorrencias,
    ocorrencias_user,
    User,
} from 'src/db/schemas';

import type { DrizzleDB } from 'src/db/types/drizzleDB';

import type { PeriodoDashboard } from './dashboard.service';

@Injectable()
export class DashboardRepository {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: DrizzleDB,
    ) {}

    // =========================================================
    // USUÁRIOS
    // =========================================================

    async resumoUsuarios() {

        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,

                ativos: sql<number>`
                    COALESCE(
                        SUM(user_ativo = 1),
                        0
                    )
                `,

                inativos: sql<number>`
                    COALESCE(
                        SUM(user_ativo = 0),
                        0
                    )
                `,
            })
            .from(User);

        return {
            total: Number(resultado.total),
            ativos: Number(resultado.ativos),
            inativos: Number(resultado.inativos),
        };
    }

    // =========================================================
    // AMBIENTES
    // =========================================================

    async resumoAmbientes() {

        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,

                ativos: sql<number>`
                    COALESCE(
                        SUM(amb_ativo = 1),
                        0
                    )
                `,

                inativos: sql<number>`
                    COALESCE(
                        SUM(amb_ativo = 0),
                        0
                    )
                `,
            })
            .from(Ambientes);

        return {
            total: Number(resultado.total),
            ativos: Number(resultado.ativos),
            inativos: Number(resultado.inativos),
        };
    }

    // =========================================================
    // COMPONENTES
    // =========================================================

    async resumoComponentes() {

        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,

                ativos: sql<number>`
                    COALESCE(
                        SUM(compo_ativo = 1),
                        0
                    )
                `,

                inativos: sql<number>`
                    COALESCE(
                        SUM(compo_ativo = 0),
                        0
                    )
                `,
            })
            .from(Componentes);

        return {
            total: Number(resultado.total),
            ativos: Number(resultado.ativos),
            inativos: Number(resultado.inativos),
        };
    }

    // =========================================================
    // DISTRIBUIÇÃO DAS OCORRÊNCIAS
    // =========================================================

    async distribuicaoOcorrencias(
        periodo: PeriodoDashboard,
    ) {

        const condicoes: SQL[] = [];

        if (periodo.inicio) {
            condicoes.push(
                gte(
                    ocorrencias.criado_em,
                    periodo.inicio,
                ),
            );
        }

        if (periodo.fim) {
            condicoes.push(
                lte(
                    ocorrencias.criado_em,
                    periodo.fim,
                ),
            );
        }

        const [resultado] = await this.db
            .select({
                total: sql<number>`
                    COUNT(*)
                `,

                abertas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Aberta'
                        ),
                        0
                    )
                `,

                andamento: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Em andamento'
                        ),
                        0
                    )
                `,

                concluidas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Concluida'
                        ),
                        0
                    )
                `,

                canceladas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Cancelada'
                        ),
                        0
                    )
                `,
            })
            .from(ocorrencias)
            .where(
                condicoes.length > 0
                    ? and(...condicoes)
                    : undefined,
            );

        return {
            total: Number(resultado.total),
            abertas: Number(resultado.abertas),
            andamento: Number(resultado.andamento),
            concluidas: Number(resultado.concluidas),
            canceladas: Number(resultado.canceladas),
        };
    }

    // =========================================================
    // OCORRÊNCIAS POR PRIORIDADE MÁXIMA
    // =========================================================

    async ocorrenciasPrioridadeMaxima(
        periodo: PeriodoDashboard,
    ) {

        const condicoes: SQL[] = [
            eq(
                ocorrencias.ocor_prioridade,
                'Critica',
            ),
        ];

        if (periodo.inicio) {
            condicoes.push(
                gte(
                    ocorrencias.criado_em,
                    periodo.inicio,
                ),
            );
        }

        if (periodo.fim) {
            condicoes.push(
                lte(
                    ocorrencias.criado_em,
                    periodo.fim,
                ),
            );
        }

        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,
            })
            .from(ocorrencias)
            .where(and(...condicoes));

        return Number(resultado.total);
    }

    // =========================================================
    // ATIVIDADES RECENTES
    // =========================================================

    async ocorrenciasRecentes(
        periodo: PeriodoDashboard,
    ) {

        const condicoes: SQL[] = [];

        if (periodo.inicio) {
            condicoes.push(
                gte(
                    ocorrencias.criado_em,
                    periodo.inicio,
                ),
            );
        }

        if (periodo.fim) {
            condicoes.push(
                lte(
                    ocorrencias.criado_em,
                    periodo.fim,
                ),
            );
        }

        return this.db
            .select({
                id: ocorrencias.id_ocor,

                nome: ocorrencias.ocor_nome,

                componente: Componentes.compo_nome,

                ambiente: Ambientes.amb_nome,

                prioridade: ocorrencias.ocor_prioridade,

                criadoEm: ocorrencias.criado_em,
            })
            .from(ocorrencias)

            .innerJoin(
                Componentes,
                eq(
                    ocorrencias.componente_id,
                    Componentes.id_compo,
                ),
            )

            .innerJoin(
                Ambientes,
                eq(
                    ocorrencias.ambiente_id,
                    Ambientes.id_amb,
                ),
            )

            .where(
                condicoes.length > 0
                    ? and(...condicoes)
                    : undefined,
            )

            .orderBy(
                desc(ocorrencias.criado_em),
            )

            .limit(5);
    }

    // =========================================================
    // OCORRÊNCIAS DO TÉCNICO
    // =========================================================

    async distribuicaoOcorrenciasTecnico(
        usuarioId: number,
        periodo: PeriodoDashboard,
    ) {

        const condicoes: SQL[] = [
            eq(
                ocorrencias_user.user_id,
                usuarioId,
            ),
        ];

        if (periodo.inicio) {
            condicoes.push(
                gte(
                    ocorrencias.criado_em,
                    periodo.inicio,
                ),
            );
        }

        if (periodo.fim) {
            condicoes.push(
                lte(
                    ocorrencias.criado_em,
                    periodo.fim,
                ),
            );
        }

        const [resultado] = await this.db
            .select({
                total: sql<number>`
                    COUNT(DISTINCT ${ocorrencias.id_ocor})
                `,

                abertas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Aberta'
                        ),
                        0
                    )
                `,

                andamento: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Em andamento'
                        ),
                        0
                    )
                `,

                concluidas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Concluida'
                        ),
                        0
                    )
                `,

                canceladas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} = 'Cancelada'
                        ),
                        0
                    )
                `,
            })
            .from(ocorrencias_user)

            .innerJoin(
                ocorrencias,
                eq(
                    ocorrencias_user.ocorrencia_id,
                    ocorrencias.id_ocor,
                ),
            )

            .where(and(...condicoes));

        return {
            total: Number(resultado.total),
            abertas: Number(resultado.abertas),
            andamento: Number(resultado.andamento),
            concluidas: Number(resultado.concluidas),
            canceladas: Number(resultado.canceladas),
        };
    }

    // =========================================================
    // ATIVIDADES RECENTES DO TÉCNICO
    // =========================================================

    async ocorrenciasRecentesTecnico(
        usuarioId: number,
        periodo: PeriodoDashboard,
    ) {

        const condicoes: SQL[] = [
            eq(
                ocorrencias_user.user_id,
                usuarioId,
            ),
        ];

        if (periodo.inicio) {
            condicoes.push(
                gte(
                    ocorrencias.criado_em,
                    periodo.inicio,
                ),
            );
        }

        if (periodo.fim) {
            condicoes.push(
                lte(
                    ocorrencias.criado_em,
                    periodo.fim,
                ),
            );
        }

        return this.db
            .select({
                id: ocorrencias.id_ocor,

                nome: ocorrencias.ocor_nome,

                componente: Componentes.compo_nome,

                ambiente: Ambientes.amb_nome,

                prioridade: ocorrencias.ocor_prioridade,

                status: ocorrencias.ocor_status,

                criadoEm: ocorrencias.criado_em,
            })

            .from(ocorrencias_user)

            .innerJoin(
                ocorrencias,
                eq(
                    ocorrencias_user.ocorrencia_id,
                    ocorrencias.id_ocor,
                ),
            )

            .innerJoin(
                Componentes,
                eq(
                    ocorrencias.componente_id,
                    Componentes.id_compo,
                ),
            )

            .innerJoin(
                Ambientes,
                eq(
                    ocorrencias.ambiente_id,
                    Ambientes.id_amb,
                ),
            )

            .where(and(...condicoes))

            .orderBy(
                desc(ocorrencias.criado_em),
            )

            .limit(5);
    }
}