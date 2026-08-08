
import {mysqlTable,
    int,
    varchar,
    timestamp,
    tinyint

} from 'drizzle-orm/mysql-core';
import {Ambientes} from "./Ambiente";
import { Componentes } from './componentes';

export const ocorrencias = mysqlTable('ocorrencias',{
id_ocor: int('id_ocorrencia').autoincrement().primaryKey(),
ocor_nome: varchar('ocorre_nome', { length: 100 }).notNull(),
ocor_status: tinyint('ocorre_status').notNull(),
ocor_prioridade: varchar('ocorre_prioridade', {length: 10}).notNull(),
// criado_em: timestamp("criado_em").defaultNow().notNull(),
// atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
// encerrado_em: timestamp("encerrado_em"),
ocor_obs: varchar('ocorre_obs', { length: 255 }),
componente_id: int('componente_id').notNull().references(() => Componentes.id_compo),  
ambiente_id: int('ambiente_id').notNull().references(() => Ambientes.id_amb)
});

export type ocorrencias = typeof ocorrencias.$inferSelect;
export type ocorrenciasInsert = typeof ocorrencias.$inferInsert;