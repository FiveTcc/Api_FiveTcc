
import {mysqlTable,
    int,
    varchar,
    datetime,

} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import {Ambientes} from "./Ambiente";
import { Componentes } from './componentes';

export const ocorrencias = mysqlTable('ocorrencias',{
id_ocor: int('id_ocorrencia').autoincrement().primaryKey(),
ocor_nome: varchar('ocorre_nome', { length: 100 }).notNull(),
ocor_status: varchar('ocorre_status', {length: 50}).notNull(),
ocor_prioridade: varchar('ocorre_prioridade', {length: 10}).notNull(),
atualizado_em: datetime("atualizado_em").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
criado_em: datetime("criado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
encerrado_em: datetime("encerrado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
ocor_obs: varchar('ocorre_obs', { length: 255 }),
componente_id: int('componente_id').notNull().references(() => Componentes.id_compo),  
ambiente_id: int('ambiente_id').notNull().references(() => Ambientes.id_amb)
});

export type ocorrencias = typeof ocorrencias.$inferSelect;
export type ocorrenciasInsert = typeof ocorrencias.$inferInsert;