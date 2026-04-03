import { query } from './db';

const SCHEMA = `
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

CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  task_id     TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  user_role   TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_notes (
  date        TEXT PRIMARY KEY,
  summary     TEXT NOT NULL DEFAULT '',
  tomorrow    TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  user_role   TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id   ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority      ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status        ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_archived      ON tasks(archived);
CREATE INDEX IF NOT EXISTS idx_tasks_date          ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_chat_created        ON chat_messages(created_at DESC);
`;

export async function runMigrations(): Promise<void> {
  console.log('[DB] Running migrations…');
  try {
    await query(SCHEMA);
    console.log('[DB] Schema ready ✓');
  } catch (err: any) {
    console.error('[DB] Migration failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => { console.log('Done'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
