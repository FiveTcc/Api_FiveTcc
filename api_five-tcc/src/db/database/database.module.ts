import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL, DRIZZLE } from './database.constants';
import * as schema from '../schemas';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,

      useFactory: async () => {
        const pool = new Pool({
          connectionString: DATABASE_URL,
        });

        return drizzle(pool, {
          schema,
        });
      },
    },
  ],

  exports: [DRIZZLE],
})

export class DatabaseModule {}
