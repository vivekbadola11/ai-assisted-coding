import type { Deps } from '../app.ts';
import { HttpError, type Router } from '../http/router.ts';
import { asObject, positiveInt } from '../http/validate.ts';
import { charge } from '../integrations/payments.ts';
import { findActiveCoupon, getOpenCartRow } from '../services/carts.ts';
import { reserveStock } from '../services/inventory.ts';
import { calculateTotals } from '../services/pricing.ts';

interface OrderRow {
  id: number;
  customer_id: number | null;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  payment_reference: string | null;
  status: string;
  created_at: string;
}

function toOrderDto(row: OrderRow) {
  return {
    id: row.id,
    customerId: row.customer_id,
    couponCode: row.coupon_code,
    subtotal: row.subtotal,
    discount: row.discount,
    tax: row.tax,
    shipping: row.shipping,
    total: row.total,
    paymentReference: row.payment_reference,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function registerOrderRoutes(router: Router<Deps>): void {
  /** POST /api/orders  { cartId: number }  — checkout */
  router.post('/api/orders', async (req, { db, config, logger }) => {
    const cartId = positiveInt(asObject(req.body).cartId, 'cartId');
    const cart = getOpenCartRow(db, cartId);

    const lines = db.prepare('SELECT product_id, quantity FROM cart_items WHERE cart_id = ?').all(cartId) as {
      product_id: number;
      quantity: number;
    }[];
    if (lines.length === 0) throw new HttpError(400, 'Cart is empty');
    logger.info('checkout started', { cartId, lines: lines.length });

    const placeholders = lines.map(() => '?').join(', ');
    const products = db
      .prepare(`SELECT id, name, price FROM products WHERE active = 1 AND id IN (${placeholders})`)
      .all(...lines.map((line) => line.product_id)) as { id: number; name: string; price: number }[];
    const productById = new Map(products.map((p) => [p.id, p]));

    const items = lines.map((line) => ({
      productId: line.product_id,
      quantity: line.quantity,
      unitPrice: productById.get(line.product_id)!.price,
    }));

    for (const item of items) {
      reserveStock(db, item.productId, item.quantity);
    }

    const coupon = cart.coupon_code ? findActiveCoupon(db, cart.coupon_code) : null;
    const totals = calculateTotals(items, coupon, config);
    const payment = await charge(totals.total, config.paymentApiKey);

    const result = db
      .prepare(
        `INSERT INTO orders
          (customer_id, cart_id, coupon_code, subtotal, discount, tax, shipping, total, payment_reference, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`,
      )
      .run(
        cart.customer_id,
        cartId,
        coupon?.code ?? null,
        totals.subtotal,
        totals.discount,
        totals.tax,
        totals.shipping,
        totals.total,
        payment.reference,
        new Date().toISOString(),
      );
    const orderId = Number(result.lastInsertRowid);

    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
    for (const item of items) insertItem.run(orderId, item.productId, item.quantity, item.unitPrice);
    db.prepare("UPDATE carts SET status = 'checked_out' WHERE id = ?").run(cartId);

    logger.info('order placed', { orderId, cartId, total: totals.total, payment: payment.reference });
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as unknown as OrderRow;
    return { status: 201, body: { ...toOrderDto(order), items } };
  });

  /** GET /api/orders?customerId=12 — order history, newest first */
  router.get('/api/orders', (req, { db }) => {
    const customerId = positiveInt(req.query.get('customerId'), 'customerId');
    const orders = db
      .prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC')
      .all(customerId) as unknown as OrderRow[];

    const result = orders.map((order) => {
      const items = db
        .prepare(
          `SELECT oi.product_id AS productId, p.name, oi.quantity, oi.unit_price AS unitPrice
           FROM order_items oi JOIN products p ON p.id = oi.product_id
           WHERE oi.order_id = ?`,
        )
        .all(order.id);
      return { ...toOrderDto(order), items };
    });

    return { status: 200, body: { orders: result } };
  });

  router.get('/api/orders/:id', (req, { db }) => {
    const id = positiveInt(req.params.id, 'id');
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
    if (!order) throw new HttpError(404, `Order ${id} not found`);
    const items = db
      .prepare(
        `SELECT oi.product_id AS productId, p.name, oi.quantity, oi.unit_price AS unitPrice
         FROM order_items oi JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
      )
      .all(id);
    return { status: 200, body: { ...toOrderDto(order), items } };
  });
}
