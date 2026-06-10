import {
  pgTable,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';

export const test = pgTable('test', {
  id: integer('id')
    .primaryKey()
    .notNull(),
  nome: varchar('nome', {
    length: 255,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  }).notNull(),
});

export type Test = typeof test.$inferSelect;
export type TestInsert = typeof test.$inferInsert;