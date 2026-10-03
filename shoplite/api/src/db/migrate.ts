import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { transaction, type DB } from './connection.ts';

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

/**
 * Apply every migrations/*.sql file that has not been applied yet, in
 * file-name order. Applied migrations are recorded in schema_migrations.
 * Never edit a migration that has shipped: add a new numbered file instead.
 */
export function migrate(db: DB): string[] {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);

  const rows = db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[];
  const applied = new Set(rows.map((row) => row.name));
  const pending = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    transaction(db, () => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(file, new Date().toISOString());
    });
  }
  return pending;
}
