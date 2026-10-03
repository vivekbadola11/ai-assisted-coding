import type { DB } from '../src/db/connection.ts';

/**
 * Small, explicit test data. Ids are fixed so tests can refer to them.
 *   1 Cotton Crew T-Shirt   ₹499    stock 50
 *   2 Steel Water Bottle 1L ₹349    stock 3
 *   3 Classic Denim Jacket  ₹1999   discontinued (active = 0)
 *   4 Ceramic Coffee Mug    ₹249.50 stock 20
 *   5..29 filler products   ₹100+   one per day, newest last
 */
export function insertFixture(db: DB): void {
  db.exec(`
    INSERT INTO categories (id, slug, name) VALUES (1, 'apparel', 'Apparel'), (2, 'kitchen', 'Kitchen');

    INSERT INTO products (id, sku, name, category_id, price, stock, active, created_at) VALUES
      (1, 'T-001', 'Cotton Crew T-Shirt', 1, 499, 50, 1, '2026-01-01T00:00:00.000Z'),
      (2, 'T-002', 'Steel Water Bottle 1L', 2, 349, 3, 1, '2026-01-02T00:00:00.000Z'),
      (3, 'T-003', 'Classic Denim Jacket', 1, 1999, 5, 0, '2026-01-03T00:00:00.000Z'),
      (4, 'T-004', 'Ceramic Coffee Mug', 2, 249.5, 20, 1, '2026-01-04T00:00:00.000Z');

    INSERT INTO coupons (code, type, value, min_subtotal, active) VALUES
      ('SAVE10', 'percent', 10, 0, 1),
      ('FLAT100', 'flat', 100, 500, 1),
      ('EXPIRED5', 'percent', 5, 0, 0);

    INSERT INTO customers (id, full_name, email, phone, address, marketing_opt_in, created_at) VALUES
      (1, 'Test Customer', 'test.customer@example.com', '+91 00000 00001', 'Flat 1, Example Residency, Testpur 000101', 0, '2026-01-01T00:00:00.000Z');
  `);

  const insertFiller = db.prepare(
    "INSERT INTO products (id, sku, name, category_id, price, stock, active, created_at) VALUES (?, ?, ?, 2, ?, 10, 1, ?)",
  );
  for (let id = 5; id <= 29; id++) {
    const day = String(id).padStart(2, '0');
    insertFiller.run(id, `T-${String(id).padStart(3, '0')}`, `Filler Product ${id}`, 100 + id, `2026-03-${day}T00:00:00.000Z`);
  }
}
