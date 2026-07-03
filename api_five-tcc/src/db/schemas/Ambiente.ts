import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
  
} from 'drizzle-orm/mysql-core';
import {User} from "./User";

export const Ambientes = mysqlTable('ambientes', {
  id_amb: int('id_amb').autoincrement().primaryKey(),
  amb_nome: varchar('amb_nome', { length: 100 }).notNull(),
  amb_tipo: varchar('amb_tipo', { length: 50 }).notNull(),
  amb_bloco: varchar('amb_bloco', { length: 5 }).notNull(),
  amb_andar: varchar('amb_andar', { length: 2 }).notNull(),
  amb_ativo: boolean('amb_ativo').default(true).notNull(),
  amb_obs: varchar('amb_obs', { length: 100 }),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  id_user: int('id_user').notNull().references(() => User.id_user)

});

export type Ambientes = typeof Ambientes.$inferSelect;
export type AmbientesInsert = typeof Ambientes.$inferInsert;
