import type { Deps } from '../app.ts';
import { HttpError, type Router } from '../http/router.ts';
import { asObject, nonEmptyString, optionalPositiveInt, positiveInt } from '../http/validate.ts';
import { findActiveCoupon, getOpenCartRow, loadCartDto } from '../services/carts.ts';

export function registerCartRoutes(router: Router<Deps>): void {
  /** POST /api/carts  { customerId?: number } */
  router.post('/api/carts', (req, { db, config }) => {
    const body = req.body === undefined ? {} : asObject(req.body);
    const customerId = body.customerId === undefined ? null : positiveInt(body.customerId, 'customerId');
    const result = db
      .prepare("INSERT INTO carts (customer_id, status, created_at) VALUES (?, 'open', ?)")
      .run(customerId, new Date().toISOString());
    return { status: 201, body: loadCartDto(db, Number(result.lastInsertRowid), config) };
  });

  router.get('/api/carts/:id', (req, { db, config }) => {
    const id = positiveInt(req.params.id, 'id');
    return { status: 200, body: loadCartDto(db, id, config) };
  });

  /** POST /api/carts/:id/items  { productId: number, quantity?: number } */
  router.post('/api/carts/:id/items', (req, { db, config }) => {
    const cartId = positiveInt(req.params.id, 'id');
    getOpenCartRow(db, cartId);
    const body = asObject(req.body);
    const productId = positiveInt(body.productId, 'productId');
    const quantity = optionalPositiveInt(body.quantity, 'quantity', 1);

    const product = db.prepare('SELECT id, stock, active FROM products WHERE id = ?').get(productId) as
      | { id: number; stock: number; active: number }
      | undefined;
    if (!product || !product.active) throw new HttpError(404, `Product ${productId} not found`);
    if (product.stock <= 0) throw new HttpError(409, 'Product is out of stock');

    db.prepare(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`,
    ).run(cartId, productId, quantity);

    return { status: 200, body: loadCartDto(db, cartId, config) };
  });

  /** PATCH /api/carts/:id/items/:productId  { quantity: number } */
  router.patch('/api/carts/:id/items/:productId', (req, { db, config }) => {
    const cartId = positiveInt(req.params.id, 'id');
    const productId = positiveInt(req.params.productId, 'productId');
    getOpenCartRow(db, cartId);
    const quantity = positiveInt(asObject(req.body).quantity, 'quantity');
    const result = db
      .prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?')
      .run(quantity, cartId, productId);
    if (result.changes === 0) throw new HttpError(404, `Product ${productId} is not in cart ${cartId}`);
    return { status: 200, body: loadCartDto(db, cartId, config) };
  });

  router.delete('/api/carts/:id/items/:productId', (req, { db, config }) => {
    const cartId = positiveInt(req.params.id, 'id');
    const productId = positiveInt(req.params.productId, 'productId');
    getOpenCartRow(db, cartId);
    db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId, productId);
    return { status: 200, body: loadCartDto(db, cartId, config) };
  });

  /** POST /api/carts/:id/coupon  { code: string } */
  router.post('/api/carts/:id/coupon', (req, { db, config }) => {
    const cartId = positiveInt(req.params.id, 'id');
    getOpenCartRow(db, cartId);
    const code = nonEmptyString(asObject(req.body).code, 'code');
    const coupon = findActiveCoupon(db, code);
    if (!coupon) throw new HttpError(404, `Coupon ${code} is not valid`);
    db.prepare('UPDATE carts SET coupon_code = ? WHERE id = ?').run(coupon.code, cartId);
    return { status: 200, body: loadCartDto(db, cartId, config) };
  });

  router.delete('/api/carts/:id/coupon', (req, { db, config }) => {
    const cartId = positiveInt(req.params.id, 'id');
    getOpenCartRow(db, cartId);
    db.prepare('UPDATE carts SET coupon_code = NULL WHERE id = ?').run(cartId);
    return { status: 200, body: loadCartDto(db, cartId, config) };
  });
}
