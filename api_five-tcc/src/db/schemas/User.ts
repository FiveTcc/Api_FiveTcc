
import {datetime ,varchar, int, mysqlTable, boolean

} from "drizzle-orm/mysql-core";




export const User = mysqlTable ("users" ,{

    id_user: int("id_user").primaryKey().autoincrement(),
    user_nome: varchar("user_nome", { length: 100 }),
    user_email: varchar("user_email", { length: 255 }).unique(),
    user_tel: varchar("user_telefone", { length: 20 }),
    user_tipo: varchar("user_tipo", { length: 20 }),
    user_senha: varchar("user_senha", { length: 40 }),
    user_ativo: boolean("user_ativo").default(true),
    atualizado_em: datetime("atualizado_em"),
    criado_em: datetime("criado_em")
})

export type User = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
