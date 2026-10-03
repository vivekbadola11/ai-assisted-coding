import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config } from '../src/config.ts';
import { roundMoney } from '../src/lib/money.ts';
import { calculateDiscount, calculateTotals, type Coupon } from '../src/services/pricing.ts';

const SAVE10: Coupon = { code: 'SAVE10', type: 'percent', value: 10, minSubtotal: 0 };
const FLAT100: Coupon = { code: 'FLAT100', type: 'flat', value: 100, minSubtotal: 500 };

describe('pricing', () => {
  it('sums line items into the subtotal', () => {
    const totals = calculateTotals(
      [
        { unitPrice: 499, quantity: 2 },
        { unitPrice: 249.5, quantity: 1 },
      ],
      null,
      config,
    );
    assert.equal(roundMoney(totals.subtotal), 1247.5);
  });

  it('applies a percentage coupon to the subtotal', () => {
    assert.equal(roundMoney(calculateDiscount(998, SAVE10)), 99.8);
  });

  it('ignores a flat coupon below its minimum subtotal', () => {
    assert.equal(calculateDiscount(349, FLAT100), 0);
  });

  it('never discounts more than the subtotal', () => {
    assert.equal(calculateDiscount(80, { ...FLAT100, minSubtotal: 0 }), 80);
  });

  it('charges shipping below the free-shipping threshold', () => {
    const totals = calculateTotals([{ unitPrice: 349, quantity: 1 }], null, config);
    assert.equal(totals.shipping, config.shippingFee);
  });

  it('ships free well above the threshold', () => {
    const totals = calculateTotals([{ unitPrice: 1500, quantity: 1 }], null, config);
    assert.equal(totals.shipping, 0);
  });

  it('without a coupon, total = subtotal + GST + shipping', () => {
    const totals = calculateTotals([{ unitPrice: 349, quantity: 1 }], null, config);
    assert.equal(roundMoney(totals.tax), 62.82);
    assert.equal(roundMoney(totals.total), 460.82);
  });
});
