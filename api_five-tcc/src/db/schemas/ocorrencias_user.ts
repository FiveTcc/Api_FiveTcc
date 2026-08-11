import {
    mysqlTable,
    int,
    datetime,
    varchar,
    tinyint

} from 'drizzle-orm/mysql-core';
import { ocorrencias } from './ocorrencias';
import { User } from './User';
import { sql } from 'drizzle-orm';

export const ocorrencias_user = mysqlTable('ocorrencias_user', {
    id_ocor_user: int('id_ocorrencias_user').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => User.id_user),
    ocorrencia_id: int('ocorrencia_id').notNull().references(() => ocorrencias.id_ocor),
    data_atribuicao: datetime("atualizado_em").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
    ocor_user_obs: varchar('ocor_user_obs', { length: 150 }),
    ocor_user_tipo: tinyint('ocor_user_tipo').notNull()
});

export type ocorrencias_user = typeof ocorrencias_user.$inferSelect;
export type ocorrencias_userInsert = typeof ocorrencias_user.$inferInsert;