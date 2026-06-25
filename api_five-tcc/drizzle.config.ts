import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schemas/index.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url,
  },
});
