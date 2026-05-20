
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../schemas/index';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
