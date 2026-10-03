import type { DB } from '../db/connection.ts';

/** Take `quantity` units of a product out of stock for an order. */
export function reserveStock(db: DB, productId: number, quantity: number): void {
  db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, productId);
}

/** Put units back, e.g. when an order is cancelled. */
export function releaseStock(db: DB, productId: number, quantity: number): void {
  db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, productId);
}
