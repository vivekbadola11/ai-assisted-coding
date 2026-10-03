import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { Config } from './config.ts';
import type { DB } from './db/connection.ts';
import { HttpError, Router, type ApiResponse } from './http/router.ts';
import type { Logger } from './lib/logger.ts';
import { registerAdminRoutes } from './routes/admin.ts';
import { registerCartRoutes } from './routes/carts.ts';
import { registerOrderRoutes } from './routes/orders.ts';
import { registerProductRoutes } from './routes/products.ts';

const SLOW_REQUEST_MS = 500;

/** Everything a route handler needs. Passed in so tests can use an in-memory DB. */
export interface Deps {
  db: DB;
  config: Config;
  logger: Logger;
}

export function buildRouter(): Router<Deps> {
  const router = new Router<Deps>();
  registerProductRoutes(router);
  registerCartRoutes(router);
  registerOrderRoutes(router);
  registerAdminRoutes(router);
  return router;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return undefined;
  const text = Buffer.concat(chunks).toString('utf8');
  if (text.trim() === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Request body is not valid JSON');
  }
}

function send(res: ServerResponse, response: ApiResponse): void {
  const headers = { ...response.headers };
  let payload = '';
  if (typeof response.body === 'string' && headers['content-type']) {
    payload = response.body;
  } else if (response.body !== undefined) {
    headers['content-type'] = 'application/json; charset=utf-8';
    payload = JSON.stringify(response.body);
  }
  res.writeHead(response.status, headers);
  res.end(payload);
}

export function createApp(deps: Deps): Server {
  const router = buildRouter();

  return createServer(async (req, res) => {
    const started = performance.now();
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', 'http://localhost');
    let status = 500;

    try {
      const match = router.match(method, url.pathname);
      if (!match) {
        status = 404;
        send(res, { status, body: { error: `No route for ${method} ${url.pathname}` } });
        return;
      }
      const body = await readJsonBody(req);
      const response = await match.handler(
        { method, path: url.pathname, params: match.params, query: url.searchParams, headers: req.headers, body },
        deps,
      );
      status = response.status;
      send(res, response);
    } catch (err) {
      if (err instanceof HttpError) {
        status = err.status;
        send(res, { status, body: { error: err.message } });
      } else {
        status = 500;
        deps.logger.error('unhandled error', {
          method,
          path: url.pathname,
          error: err instanceof Error ? err.stack : String(err),
        });
        send(res, { status, body: { error: 'Internal server error' } });
      }
    } finally {
      const ms = Math.round(performance.now() - started);
      deps.logger.info('request', { method, path: url.pathname, status, ms });
      if (ms > SLOW_REQUEST_MS) {
        deps.logger.warn('slow request', { method, path: url.pathname, query: url.search, ms });
      }
    }
  });
}
