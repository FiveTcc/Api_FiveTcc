import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const Ambiente = mysqlTable('ambientes', {
  amb_id: int('amb_id').autoincrement().primaryKey(),

  amb_nome: varchar('amb_nome', { length: 100 }).notNull(),

  amb_tipo: varchar('amb_tipo', { length: 50 }).notNull(),

  amb_bloco: varchar('amb_bloco', { length: 50 }).notNull(),

  amb_descricao: text('amb_descricao'),

  amb_ativo: boolean('amb_ativo').default(true),

  createdAt: timestamp('created_at').defaultNow(),

  updatedAt: timestamp('updated_at').defaultNow(),
});