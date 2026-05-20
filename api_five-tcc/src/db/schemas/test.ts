import {
  int,
  nvarchar,
  
  mssqlTable,
} from 'drizzle-orm/mssql-core';
import e from 'express';

export const test = mssqlTable('test', {
  id: int('id').primaryKey().identity(),

  nome: nvarchar('nome', { length: 255 }).notNull(),

    
});

export type Test = typeof test.$inferSelect;
export type TestInsert = typeof test.$inferInsert;