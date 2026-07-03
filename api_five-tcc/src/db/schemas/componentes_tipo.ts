import {
  mysqlTable,
  int,
  varchar,
  
} from 'drizzle-orm/mysql-core';

export const Componentes_tipo = mysqlTable('componentes_tipo', {
    id_compo_tipo: int('id_compo_tipo').autoincrement().primaryKey(),
    compo_tipo: varchar('compo_tipo', { length: 100 }).notNull(),
});

export type Componentes_tipo = typeof Componentes_tipo.$inferSelect;
export type Componentes_tipoInsert = typeof Componentes_tipo.$inferInsert;

