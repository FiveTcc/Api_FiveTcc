import { defineConfig } from 'drizzle-kit';
import { DATABASE_URL } from './src/db/database/database.constants';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schemas/index.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
