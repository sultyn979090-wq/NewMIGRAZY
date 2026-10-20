import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { createMockDrizzleDb } from './in-memory-db';

declare global {
  var _postgresPool: Pool | undefined;
  var _activeDb: any | undefined;
}

export const createPool = () => {
  if (!process.env.SQL_HOST) {
    return null;
  }

  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432,
      max: 10,
      connectionTimeoutMillis: 5000,
    });

    global._postgresPool.on('error', (err) => {
      console.warn('Unexpected error on idle SQL pool client:', err.message);
    });
  }
  return global._postgresPool;
};

// Initialize database instance
function initDatabase() {
  if (global._activeDb) {
    return global._activeDb;
  }

  const pool = createPool();
  if (pool && process.env.SQL_HOST) {
    try {
      global._activeDb = drizzle(pool, { schema });
      return global._activeDb;
    } catch (err: any) {
      console.warn('[AI Studio] PostgreSQL connection failed, falling back to in-memory store:', err.message);
    }
  }

  // Fallback to in-memory store
  global._activeDb = createMockDrizzleDb();
  return global._activeDb;
}

export const db: NodePgDatabase<typeof schema> = initDatabase() as unknown as NodePgDatabase<typeof schema>;

