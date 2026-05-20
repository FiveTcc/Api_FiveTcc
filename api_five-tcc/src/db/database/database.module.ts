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
        const connection = await mysql.createConnection(
          DATABASE_URL,
        );

        return drizzle(connection, {
        schema,
        mode: 'default',

        });
  
      },
    },
  ],

  exports: [DRIZZLE],
})

export class DatabaseModule {}
