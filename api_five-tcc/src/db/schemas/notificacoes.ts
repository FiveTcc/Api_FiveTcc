import { mysqlTable, int, varchar, boolean, datetime, mysqlEnum, } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { User } from './User';
import { ocorrencias } from './ocorrencias';

export const notificacoes = mysqlTable('notificacoes', {
  id_notificacao: int('id_notificacao').autoincrement().primaryKey(),

  id_user: int('id_user').notNull().references(() => User.id_user),

  titulo: varchar('titulo', { length: 150 }).notNull(),

  mensagem: varchar('mensagem', { length: 255 }).notNull(),

  tipo: mysqlEnum('tipo', ['NOVA_OCORRENCIA', 'ALTERACAO_STATUS', 'ENCERRAMENTO', 'ALERTA',]).notNull(),

  id_ocorrencia: int('id_ocorrencia').references(() => ocorrencias.id_ocor),

  lida: boolean('lida').default(false).notNull(),

  criado_em: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`),
});
