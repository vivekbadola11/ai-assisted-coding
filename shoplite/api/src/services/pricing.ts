/**
 * Cart and order pricing. Business rules live in docs/business-rules.md.
 */
import type { Config } from '../config.ts';
import { roundMoney } from '../lib/money.ts';

export interface PricedItem {
  unitPrice: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

type PricingConfig = Pick<Config, 'taxRate' | 'freeShippingThreshold' | 'shippingFee'>;

export function calculateSubtotal(items: PricedItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function calculateDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === 'percent') return (subtotal * coupon.value) / 100;
  return Math.min(coupon.value, subtotal);
}

/** Free at or above the threshold, based on the subtotal before discount. */
export function calculateShipping(subtotal: number, config: PricingConfig): number {
  return subtotal >= config.freeShippingThreshold ? 0 : config.shippingFee;
}

/**
 * Price a cart. GST is charged on the subtotal after the coupon discount, and
 * every amount is rounded to paise so the parts always add up to the total.
 */
export function calculateTotals(items: PricedItem[], coupon: Coupon | null, config: PricingConfig): Totals {
  const subtotal = roundMoney(calculateSubtotal(items));
  const discount = roundMoney(calculateDiscount(subtotal, coupon));
  const tax = roundMoney((subtotal - discount) * config.taxRate);
  const shipping = roundMoney(calculateShipping(subtotal, config));
  const total = roundMoney(subtotal - discount + tax + shipping);
  return { subtotal, discount, tax, shipping, total };
}
