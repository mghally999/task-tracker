import { Pool, PoolClient } from 'pg';

// ─── Lazy pool — only created when first query runs ───────────────────────────
// This ensures dotenv has already loaded DATABASE_URL before we use it.
declare global {
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (global.__pgPool) return global.__pgPool;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      '\n[DB] DATABASE_URL is not set.\n' +
      '  • Local dev: make sure .env exists in the project root with DATABASE_URL=postgresql://...\n' +
      '  • Railway:   add a PostgreSQL plugin — it sets DATABASE_URL automatically.\n'
    );
  }

  global.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  global.__pgPool.on('error', (err) => {
    console.error('[DB] Pool error:', err.message);
  });

  return global.__pgPool;
}

// Exported for graceful shutdown in server.ts
export function getPoolInstance(): Pool { return getPool(); }

// Run a query — lazy pool creation happens here
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Run multiple queries in a transaction
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

