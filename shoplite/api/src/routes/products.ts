import type { Deps } from '../app.ts';
import { HttpError, type Router } from '../http/router.ts';
import { optionalPositiveInt, positiveInt } from '../http/validate.ts';

interface ProductRow {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
}

function toProductDto(row: ProductRow) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price,
    stock: row.stock,
    inStock: row.stock > 0,
  };
}

const PRODUCT_COLUMNS = `p.id, p.sku, p.name, p.description, c.slug AS category, p.price, p.stock`;

function encodeCursor(createdAt: string, id: number): string {
  return Buffer.from(JSON.stringify([createdAt, id])).toString('base64url');
}

function decodeCursor(cursor: string): { createdAt: string; id: number } {
  try {
    const [createdAt, id] = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as [unknown, unknown];
    if (typeof createdAt === 'string' && typeof id === 'number' && Number.isInteger(id)) return { createdAt, id };
  } catch {
    // fall through
  }
  throw new HttpError(400, 'cursor is not valid');
}

export function registerProductRoutes(router: Router<Deps>): void {
  /**
   * GET /api/products?page=1&pageSize=20&q=mug&category=kitchen
   * Newest products first.
   */
  router.get('/api/products', (req, { db }) => {
    const page = optionalPositiveInt(req.query.get('page'), 'page', 1);
    const pageSize = Math.min(optionalPositiveInt(req.query.get('pageSize'), 'pageSize', 20), 100);
    const q = (req.query.get('q') ?? '').trim();
    const category = (req.query.get('category') ?? '').trim();

    const where = `p.active = 1
      AND (? = '' OR p.name LIKE '%' || ? || '%')
      AND (? = '' OR c.slug = ?)`;
    const filters = [q, q, category, category];

    const offset = (page - 1) * pageSize;

    const rows = db
      .prepare(
        `SELECT ${PRODUCT_COLUMNS}
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE ${where}
         ORDER BY p.created_at DESC, p.id DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...filters, pageSize, offset) as unknown as ProductRow[];

    const { total } = db
      .prepare(`SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id WHERE ${where}`)
      .get(...filters) as { total: number };

    return {
      status: 200,
      body: {
        items: rows.map(toProductDto),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  });

  /**
   * GET /api/products/feed?limit=20&cursor=<nextCursor>
   * Keyset ("cursor") paging for infinite scroll (SHOP-105). Stable while
   * products are added, and fast at any depth. See docs/decisions/0001-product-paging.md.
   */
  router.get('/api/products/feed', (req, { db }) => {
    const limit = Math.min(optionalPositiveInt(req.query.get('limit'), 'limit', 20), 100);
    const cursor = req.query.get('cursor');
    const after = cursor ? decodeCursor(cursor) : null;

    const rows = db
      .prepare(
        `SELECT ${PRODUCT_COLUMNS}, p.created_at
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.active = 1
           AND (? IS NULL OR p.created_at < ? OR (p.created_at = ? AND p.id < ?))
         ORDER BY p.created_at DESC, p.id DESC
         LIMIT ?`,
      )
      .all(
        after?.createdAt ?? null,
        after?.createdAt ?? null,
        after?.createdAt ?? null,
        after?.id ?? null,
        limit + 1,
      ) as unknown as (ProductRow & { created_at: string })[];

    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);
    const last = page.at(-1);
    return {
      status: 200,
      body: {
        items: page.map(toProductDto),
        nextCursor: hasMore && last ? encodeCursor(last.created_at, last.id) : null,
      },
    };
  });

  router.get('/api/products/:id', (req, { db }) => {
    const id = positiveInt(req.params.id, 'id');
    const row = db
      .prepare(
        `SELECT ${PRODUCT_COLUMNS}
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.id = ? AND p.active = 1`,
      )
      .get(id) as ProductRow | undefined;
    if (!row) throw new HttpError(404, `Product ${id} not found`);
    return { status: 200, body: toProductDto(row) };
  });
}
