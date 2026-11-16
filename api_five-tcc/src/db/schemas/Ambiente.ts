import { mysqlTable, int, varchar, boolean, datetime, } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { User } from './User';

export const Ambientes = mysqlTable('ambientes', {
  id_amb: int('id_amb').autoincrement().primaryKey(),
  amb_nome: varchar('amb_nome', { length: 100 }).notNull(),
  amb_tipo: varchar('amb_tipo', { length: 50 }).notNull(),
  amb_bloco: varchar('amb_bloco', { length: 5 }).notNull(),
  amb_andar: varchar('amb_andar', { length: 2 }).notNull(),
  amb_ativo: boolean('amb_ativo').default(true).notNull(),
  amb_obs: varchar('amb_obs', { length: 100 }),
  atualizado_em: datetime("atualizado_em").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  criado_em: datetime("criado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
  id_user: int('id_user').notNull().references(() => User.id_user)

});

export type Ambientes = typeof Ambientes.$inferSelect;
export type AmbientesInsert = typeof Ambientes.$inferInsert;
