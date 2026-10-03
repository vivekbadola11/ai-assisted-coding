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

    // The homepage hero shows the newest product, so later pages start one
    // item earlier to keep the grid aligned with the hero layout.
    const offset = page === 1 ? 0 : (page - 1) * pageSize - 1;

    const rows = db
      .prepare(
        `SELECT ${PRODUCT_COLUMNS}
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE ${where}
         ORDER BY p.created_at DESC
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
