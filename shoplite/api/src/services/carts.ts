import type { Config } from '../config.ts';
import type { DB } from '../db/connection.ts';
import { HttpError } from '../http/router.ts';
import { calculateTotals, type Coupon, type Totals } from './pricing.ts';

export interface CartLineDto {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CartDto {
  id: number;
  customerId: number | null;
  couponCode: string | null;
  status: 'open' | 'checked_out';
  items: CartLineDto[];
  totals: Totals;
}

interface CartRow {
  id: number;
  customer_id: number | null;
  coupon_code: string | null;
  status: 'open' | 'checked_out';
}

interface CouponRow {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  min_subtotal: number;
}

export function getCartRow(db: DB, cartId: number): CartRow {
  const cart = db.prepare('SELECT id, customer_id, coupon_code, status FROM carts WHERE id = ?').get(cartId) as
    | CartRow
    | undefined;
  if (!cart) throw new HttpError(404, `Cart ${cartId} not found`);
  return cart;
}

export function getOpenCartRow(db: DB, cartId: number): CartRow {
  const cart = getCartRow(db, cartId);
  if (cart.status !== 'open') throw new HttpError(409, `Cart ${cartId} has already been checked out`);
  return cart;
}

export function findActiveCoupon(db: DB, code: string): Coupon | null {
  const row = db
    .prepare('SELECT code, type, value, min_subtotal FROM coupons WHERE code = ? AND active = 1')
    .get(code.toUpperCase()) as CouponRow | undefined;
  if (!row) return null;
  return { code: row.code, type: row.type, value: row.value, minSubtotal: row.min_subtotal };
}

export function loadCartLines(db: DB, cartId: number): CartLineDto[] {
  const rows = db
    .prepare(
      `SELECT ci.product_id, p.name, p.price, ci.quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY p.name`,
    )
    .all(cartId) as { product_id: number; name: string; price: number; quantity: number }[];
  return rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    unitPrice: row.price,
    quantity: row.quantity,
  }));
}

export function loadCartDto(db: DB, cartId: number, config: Config): CartDto {
  const cart = getCartRow(db, cartId);
  const items = loadCartLines(db, cartId);
  const coupon = cart.coupon_code ? findActiveCoupon(db, cart.coupon_code) : null;
  return {
    id: cart.id,
    customerId: cart.customer_id,
    couponCode: cart.coupon_code,
    status: cart.status,
    items,
    totals: calculateTotals(items, coupon, config),
  };
}
