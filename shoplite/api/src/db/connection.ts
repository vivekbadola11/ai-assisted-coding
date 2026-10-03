import { DatabaseSync } from 'node:sqlite';

export type DB = DatabaseSync;

/** Open a SQLite database file (or ':memory:' for tests). */
export function openDb(path: string): DB {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 2000');
  return db;
}

/** Run `fn` inside a transaction. Rolls back if it throws. */
export function transaction<T>(db: DB, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
