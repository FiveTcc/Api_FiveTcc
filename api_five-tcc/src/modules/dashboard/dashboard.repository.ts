import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DRIZZLE } from "src/db/database/database.constants";
import { Ambientes, Componentes, User } from "src/db/schemas";
import type { DrizzleDB } from "src/db/types/drizzleDB";

@Injectable()
export class DashboardRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

    async dashboardTotal() {
        const [usuarios, ambientes, componentes] = await Promise.all
        ([
            this.dashboardUsuarios(),
            this.dashboardAmbientes(),
            this.dashboardComponentes(),
        ]);

        return {
            ...usuarios,
            ...ambientes,
            ...componentes,
        };
    }

    async dashboardUsuarios() {
        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,
                ativos: sql<number>`COALESCE(SUM(user_ativo = 1), 0)`,
                inativos: sql<number>`COALESCE(SUM(user_ativo = 0), 0)`,
            })
            .from(User);

        return {
            usuarios: {
                total: Number(resultado.total),
                ativos: Number(resultado.ativos),
                inativos: Number(resultado.inativos),
            },
        };
    }

    async dashboardAmbientes() {
        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,
                ativos: sql<number>`COALESCE(SUM(amb_ativo = 1), 0)`,
                inativos: sql<number>`COALESCE(SUM(amb_ativo = 0), 0)`,
            })
            .from(Ambientes);

        return {
            ambientes: {
                total: Number(resultado.total),
                ativos: Number(resultado.ativos),
                inativos: Number(resultado.inativos),
            },
        };
    }

    async dashboardComponentes() {
        const [resultado] = await this.db
            .select({
                total: sql<number>`COUNT(*)`,
                ativos: sql<number>`COALESCE(SUM(compo_ativo = 1), 0)`,
                inativos: sql<number>`COALESCE(SUM(compo_ativo = 0), 0)`,
            })
            .from(Componentes);

        return {
            componentes: {
                total: Number(resultado.total),
                ativos: Number(resultado.ativos),
                inativos: Number(resultado.inativos),
            },
        };
    }
}