import {
  mysqlTable,
  int,
  varchar,
  
} from 'drizzle-orm/mysql-core';

export const Componetes_tipo = mysqlTable('ambientes', {
    id_compo_tipo: int('id').autoincrement().primaryKey(),
    compo_tipo: varchar('comppo_tipo', { length: 100 }).notNull(),
});

export type Componetes_tipo = typeof Componetes_tipo.$inferSelect;
export type Componetes_tipoInsert = typeof Componetes_tipo.$inferInsert;

