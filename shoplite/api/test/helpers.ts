import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.ts';
import { config } from '../src/config.ts';
import { openDb, type DB } from '../src/db/connection.ts';
import { migrate } from '../src/db/migrate.ts';
import { logger } from '../src/lib/logger.ts';
import { insertFixture } from './fixtures.ts';

export interface TestServer {
  baseUrl: string;
  db: DB;
  close: () => Promise<void>;
  request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<{ status: number; body: any }>;
}

/** Start the API on a random port with a fresh in-memory database. */
export async function startTestServer(): Promise<TestServer> {
  process.env.LOG_LEVEL = 'silent';
  const db = openDb(':memory:');
  migrate(db);
  insertFixture(db);

  const server = createApp({ db, config, logger });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    db,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    request: async (method, path, body, headers = {}) => {
      const response = await fetch(baseUrl + path, {
        method,
        headers: { 'content-type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      const isJson = response.headers.get('content-type')?.includes('application/json');
      return { status: response.status, body: isJson ? JSON.parse(text) : text };
    },
  };
}
