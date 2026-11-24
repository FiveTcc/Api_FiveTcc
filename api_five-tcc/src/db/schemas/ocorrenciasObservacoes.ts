import {
  mysqlTable,
  int,
  text,
  datetime,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { ocorrencias } from './ocorrencias';
import { User } from './User';

export const ocorrenciasObservacoes = mysqlTable(
  'ocorrencias_observacoes',
  {
    id_obs: int('id_obs').autoincrement().primaryKey(),

    id_ocorrencia: int('id_ocorrencia')
      .notNull()
      .references(() => ocorrencias.id_ocor),

    id_user: int('id_user')
      .notNull()
      .references(() => User.id_user),

    obs_texto: text('obs_texto').notNull(),

    criada_em: datetime('criada_em')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
);

export type ocorrenciasObservacoes = typeof ocorrenciasObservacoes.$inferSelect;
export type ocorrenciasObservacoesInsert = typeof ocorrenciasObservacoes.$inferInsert;