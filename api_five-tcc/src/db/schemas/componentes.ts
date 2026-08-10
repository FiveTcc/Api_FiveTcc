import {
mysqlTable,
int,
varchar,
boolean,
datetime,
} from 'drizzle-orm/mysql-core';
import {sql} from 'drizzle-orm';
import {Ambientes} from './Ambiente';
import {Componentes_tipo} from './componentes_tipo';


export const Componentes = mysqlTable('componentes', {
id_compo: int ('id_compo').autoincrement().primaryKey(),
compo_nome: varchar ('compo_nome', { length: 100 }).notNull(),
compo_ativo: boolean('compo_ativo').default(true).notNull(),
compo_obs: varchar('compo_obs', { length: 150 }),


// atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
// criado_em: timestamp("criado_em").defaultNow().notNull(),

// possivel solucão para o erro de timestamp no mysql
atualizado_em: datetime("atualizado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
criado_em: datetime("criado_em").notNull().default(sql`CURRENT_TIMESTAMP`),

id_amb: int('id_amb').notNull().references(() => Ambientes.id_amb),
compo_tipo_id: int('compo_tipo_id').notNull().references(() => Componentes_tipo.id_compo_tipo)
});

export type Componentes = typeof Componentes.$inferSelect;
export type ComponentesInsert = typeof Componentes.$inferInsert;
