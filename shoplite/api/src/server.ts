import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApp } from './app.ts';
import { config } from './config.ts';
import { openDb } from './db/connection.ts';
import { migrate } from './db/migrate.ts';
import { logger } from './lib/logger.ts';

mkdirSync(dirname(config.dbPath), { recursive: true });
const db = openDb(config.dbPath);
const applied = migrate(db);
if (applied.length > 0) logger.info('applied migrations', { applied });

createApp({ db, config, logger }).listen(config.port, () => {
  logger.info(`ShopLite API listening on http://localhost:${config.port}`);
});
