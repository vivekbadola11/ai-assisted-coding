/**
 * A deliberately tiny router so the API has zero runtime dependencies.
 * Routes are matched in the order they are added.
 */

export interface ApiRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface ApiResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export type Handler<D> = (req: ApiRequest, deps: D) => ApiResponse | Promise<ApiResponse>;

/** Throw this from a handler to return a specific status code and message. */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface Route<D> {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler<D>;
}

export class Router<D> {
  private readonly routes: Route<D>[] = [];

  add(method: string, path: string, handler: Handler<D>): this {
    const keys: string[] = [];
    const source = path
      .replace(/[.]/g, '\\.')
      .replace(/:([A-Za-z]+)/g, (_match, key: string) => {
        keys.push(key);
        return '([^/]+)';
      });
    this.routes.push({ method, pattern: new RegExp(`^${source}$`), keys, handler });
    return this;
  }

  get(path: string, handler: Handler<D>): this {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: Handler<D>): this {
    return this.add('POST', path, handler);
  }

  patch(path: string, handler: Handler<D>): this {
    return this.add('PATCH', path, handler);
  }

  delete(path: string, handler: Handler<D>): this {
    return this.add('DELETE', path, handler);
  }

  match(method: string, path: string): { handler: Handler<D>; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const found = route.pattern.exec(path);
      if (!found) continue;
      const params: Record<string, string> = {};
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(found[index + 1]);
      });
      return { handler: route.handler, params };
    }
    return null;
  }

  /** Lists registered routes, e.g. for docs or debugging. */
  list(): string[] {
    return this.routes.map((r) => `${r.method} ${r.pattern.source}`);
  }
}
