import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { DRIZZLE } from 'src/db/database/database.constants';
import {
    Ambientes,
    Componentes,
    ocorrencias,
    User,
} from 'src/db/schemas';

import type { DrizzleDB } from 'src/db/types/drizzleDB';
import { DashboardFiltroDto } from './dto/dashboard.filtroDto';

@Injectable()
export class DashboardRepository {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: DrizzleDB,
    ) { }

    async resumo(filtro: DashboardFiltroDto) {
        const [
            usuarios,
            ambientes,
            componentes,
            //ocorrencias,
        ] = await Promise.all([
            this.resumoUsuarios(),
            this.resumoAmbientes(),
            this.resumoComponentes(),
           // this.resumoOcorrencias(filtro),
        ]);

        return {
            usuarios,
            ambientes,
            componentes,
           // ocorrencias,
        };
    }

    async distribuicao() {
        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,

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

                indefinidas: sql<number>`
                    COALESCE(
                        SUM(
                            ${ocorrencias.ocor_status} NOT IN (
                                'Aberta',
                                'Em andamento',
                                'Concluida',
                                'Cancelada'
                            )
                        ),
                        0
                    )
                `,
            })
            .from(ocorrencias);

        return {
            total: Number(resultado.total),
            abertas: Number(resultado.abertas),
            andamento: Number(resultado.andamento),
            concluidas: Number(resultado.concluidas),
            canceladas: Number(resultado.canceladas),
            indefinidas: Number(resultado.indefinidas),
        };
    }

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
}
