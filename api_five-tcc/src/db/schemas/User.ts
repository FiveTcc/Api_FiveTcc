import {
     timestamp,
     varchar, 
     int, 
     mysqlTable, 
     boolean,
} from "drizzle-orm/mysql-core";

export const User = mysqlTable("users", {

    id_user: int("id_user").primaryKey().autoincrement(),
    user_nome: varchar("user_nome", { length: 100 }).notNull(),
    user_email: varchar("user_email", { length: 255 }).unique().notNull(),
    user_tel: varchar("user_telefone", { length: 20 }).notNull(),
    user_tipo: varchar("user_tipo", { length: 20 }).notNull(),
    user_senha: varchar("user_senha", { length: 80 }).notNull(),
    user_ativo: boolean("user_ativo").default(true).notNull(),
    atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
    criado_em: timestamp("criado_em").defaultNow().notNull(),
})

export type User = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
