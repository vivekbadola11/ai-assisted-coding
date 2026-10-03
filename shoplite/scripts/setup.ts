/**
 * One-time local setup:
 *   1. create .env from .env.example (with random FAKE secrets) if it doesn't exist
 *   2. create the SQLite database, run migrations and load seed data
 *
 * Usage: npm run setup            (safe to re-run)
 *        npm run setup -- --reset (delete and rebuild the database)
 */
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { openDb } from '../api/src/db/connection.ts';
import { migrate } from '../api/src/db/migrate.ts';
import { seed } from '../api/src/db/seed.ts';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');

if (existsSync(envPath)) {
  console.log('✔ .env already exists, leaving it unchanged');
} else {
  const example = readFileSync(resolve(root, '.env.example'), 'utf8');
  const filled = example.replace(/<generate:([a-z_]+)>/g, (_match, prefix: string) => `${prefix}_${randomBytes(12).toString('hex')}`);
  writeFileSync(envPath, filled);
  console.log('✔ Created .env from .env.example (secrets are random fake values)');
}

process.loadEnvFile(envPath);
const dbPath = resolve(root, process.env.DB_PATH ?? 'api/data/shoplite.db');
mkdirSync(dirname(dbPath), { recursive: true });

if (process.argv.includes('--reset') && existsSync(dbPath)) {
  rmSync(dbPath);
  console.log('✔ Deleted existing database');
}

const isNew = !existsSync(dbPath);
const db = openDb(dbPath);
const applied = migrate(db);
if (applied.length > 0) console.log(`✔ Applied migrations: ${applied.join(', ')}`);

if (isNew) {
  seed(db);
  console.log(`✔ Seeded ${relative(root, dbPath)} with sample data (all customers are synthetic)`);
} else {
  console.log(`✔ Database ${relative(root, dbPath)} already exists (use "npm run setup -- --reset" to rebuild it)`);
}

db.close();
console.log('\nNext: npm test, then npm run dev');
