import { datetime, varchar, int, mysqlTable, boolean, } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const User = mysqlTable('users', {
  id_user: int('id_user').primaryKey().autoincrement(),
  user_nome: varchar('user_nome', { length: 100 }).notNull(),
  user_email: varchar('user_email', { length: 255 }).unique().notNull(),

  // teste de imagen
  user_imagem_url: varchar('user_imagem_url', { length: 500 }),
  user_imagem_public_id: varchar('user_imagem_public_id', { length: 255 }),

  user_tel: varchar('user_telefone', { length: 20 }).notNull(),
  user_tipo: varchar('user_tipo', { length: 20 }).notNull(),
  user_senha: varchar('user_senha', { length: 80 }).notNull(),
  user_ativo: boolean('user_ativo').default(true).notNull(),
  atualizado_em: datetime('atualizado_em').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  criado_em: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
