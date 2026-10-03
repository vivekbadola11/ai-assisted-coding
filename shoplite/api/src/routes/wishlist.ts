import type { Deps } from '../app.ts';
import type { DB } from '../db/connection.ts';
import { HttpError, type Router } from '../http/router.ts';
import { positiveInt } from '../http/validate.ts';

function requireCustomer(db: DB, customerId: number): void {
  const found = db.prepare('SELECT 1 FROM customers WHERE id = ?').get(customerId);
  if (!found) throw new HttpError(404, `Customer ${customerId} not found`);
}

function loadWishlist(db: DB, customerId: number) {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.price, p.stock
       FROM wishlist_items w JOIN products p ON p.id = w.product_id
       WHERE w.customer_id = ? AND p.active = 1
       ORDER BY w.created_at DESC, p.id DESC`,
    )
    .all(customerId) as { id: number; name: string; price: number; stock: number }[];
  return {
    customerId,
    items: rows.map((row) => ({ productId: row.id, name: row.name, price: row.price, inStock: row.stock > 0 })),
  };
}

/** SHOP-102. No real auth yet, so the customer id is in the path (see the ticket). */
export function registerWishlistRoutes(router: Router<Deps>): void {
  router.get('/api/customers/:customerId/wishlist', (req, { db }) => {
    const customerId = positiveInt(req.params.customerId, 'customerId');
    requireCustomer(db, customerId);
    return { status: 200, body: loadWishlist(db, customerId) };
  });

  /** Idempotent: adding a product that's already on the wishlist is a no-op. */
  router.put('/api/customers/:customerId/wishlist/:productId', (req, { db }) => {
    const customerId = positiveInt(req.params.customerId, 'customerId');
    const productId = positiveInt(req.params.productId, 'productId');
    requireCustomer(db, customerId);
    const product = db.prepare('SELECT 1 FROM products WHERE id = ? AND active = 1').get(productId);
    if (!product) throw new HttpError(404, `Product ${productId} not found`);
    db.prepare('INSERT OR IGNORE INTO wishlist_items (customer_id, product_id, created_at) VALUES (?, ?, ?)').run(
      customerId,
      productId,
      new Date().toISOString(),
    );
    return { status: 200, body: loadWishlist(db, customerId) };
  });

  router.delete('/api/customers/:customerId/wishlist/:productId', (req, { db }) => {
    const customerId = positiveInt(req.params.customerId, 'customerId');
    const productId = positiveInt(req.params.productId, 'productId');
    requireCustomer(db, customerId);
    db.prepare('DELETE FROM wishlist_items WHERE customer_id = ? AND product_id = ?').run(customerId, productId);
    return { status: 200, body: loadWishlist(db, customerId) };
  });
}
