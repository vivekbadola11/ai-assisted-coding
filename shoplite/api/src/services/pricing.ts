/**
 * Cart and order pricing. Business rules live in docs/business-rules.md.
 */
import type { Config } from '../config.ts';

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

export function calculateShipping(subtotal: number, config: PricingConfig): number {
  return subtotal > config.freeShippingThreshold ? 0 : config.shippingFee;
}

export function calculateTotals(items: PricedItem[], coupon: Coupon | null, config: PricingConfig): Totals {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, coupon);
  const tax = subtotal * config.taxRate;
  const shipping = calculateShipping(subtotal, config);
  const total = subtotal - discount + tax + shipping;
  return { subtotal, discount, tax, shipping, total };
}
