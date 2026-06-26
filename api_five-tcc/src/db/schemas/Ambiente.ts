import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
  
} from 'drizzle-orm/mysql-core';
import {User} from "./User";

export const ambientes = mysqlTable('ambientes', {
  id_amb: int('id').autoincrement().primaryKey(),
  amb_Nome: varchar('amb_nome', { length: 100 }).notNull(),
  amb_Tipo: varchar('amb_tipo', { length: 50 }).notNull(),
  amb_Bloco: varchar('amb_bloco', { length: 5 }).notNull(),
  amb_Andar: varchar('amb_andar', { length: 2 }).notNull(),
  amb_Ativo: boolean('amb_ativo').default(true).notNull(),
  amb_Obs: varchar('amb_obs', { length: 100 }),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  id_user: int('id_user').notNull().references(() => User.id_user)


});