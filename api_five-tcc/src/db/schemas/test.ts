import {
  int,
  varchar,
  mysqlTable,
} from 'drizzle-orm/mysql-core';

export const test = mysqlTable('test', {
  id: int('id')
    .primaryKey()
    .autoincrement(),

  nome: varchar('nome', {
    length: 255,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  }).notNull(),
});

export type Test = typeof test.$inferSelect;
export type TestInsert = typeof test.$inferInsert;