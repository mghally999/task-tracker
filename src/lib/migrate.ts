import { getPoolInstance, query } from './db';
import { INITIAL_TASKS, INITIAL_NOTES } from './initialData';

const SCHEMA = `
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Follow-up',
  priority    TEXT NOT NULL DEFAULT 'Medium',
  status      TEXT NOT NULL DEFAULT 'pending',
  time        TEXT NOT NULL DEFAULT '',
  owner       TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  archived    BOOLEAN NOT NULL DEFAULT FALSE,
  archived_on TEXT,
  pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  task_id     TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  user_role   TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast comment lookup by task
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- Index for common filter patterns
CREATE INDEX IF NOT EXISTS idx_tasks_priority  ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status    ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_archived  ON tasks(archived);
CREATE INDEX IF NOT EXISTS idx_tasks_date      ON tasks(date);

-- Notes / end-of-day summary (key-value store)
CREATE TABLE IF NOT EXISTS notes (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function runMigrations(): Promise<void> {
  console.log('[DB] Running migrations…');
  try {
    await query(SCHEMA);
    console.log('[DB] Schema ready ✓');
    await seedIfEmpty();
  } catch (err: any) {
    console.error('[DB] Migration failed:', err.message);
    throw err;
  }
}

async function seedIfEmpty(): Promise<void> {
  const rows = await query<{ count: string }>('SELECT COUNT(*) as count FROM tasks');
  const count = parseInt(rows[0]?.count || '0', 10);
  if (count > 0) {
    console.log(`[DB] Database has ${count} tasks — skipping seed`);
    return;
  }

  console.log('[DB] Seeding initial tasks…');

  const client = await getPoolInstance().connect();
  try {
    await client.query('BEGIN');

    for (const task of INITIAL_TASKS) {
      await client.query(
        `INSERT INTO tasks
          (id, date, name, category, priority, status, time, owner, notes,
           archived, archived_on, pinned, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          task.id, task.date, task.name, task.category, task.priority,
          task.status, task.time, task.owner, task.notes,
          task.archived, task.archivedOn || null, task.pinned,
          task.createdAt, task.updatedAt,
        ]
      );
    }

    // Seed notes
    await client.query(
      `INSERT INTO notes (key, value) VALUES ('summary', ''), ('tomorrow', '')
       ON CONFLICT (key) DO NOTHING`
    );

    await client.query('COMMIT');
    console.log(`[DB] Seeded ${INITIAL_TASKS.length} tasks ✓`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run directly: npx tsx src/lib/migrate.ts
if (require.main === module) {
  runMigrations()
    .then(() => { console.log('Done'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
