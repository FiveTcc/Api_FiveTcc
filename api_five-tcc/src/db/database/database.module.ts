import { Global, Module } from '@nestjs/common';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { DATABASE_URL, DRIZZLE } from './database.constants';
import * as schema from '../schemas';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,

      useFactory: async () => {
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        });

      },
    },
  ],

  exports: [DRIZZLE],
})

export class DatabaseModule { }
