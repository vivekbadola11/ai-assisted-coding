import { describe, expect, it } from 'vitest';
import type { CartDto } from '../api/client';
import reducer, { addToCart, loadCart, setSearchQuery } from './cartSlice';

const cart: CartDto = {
  id: 7,
  customerId: null,
  couponCode: null,
  status: 'open',
  items: [{ productId: 1, name: 'Cotton Crew T-Shirt', unitPrice: 499, quantity: 2 }],
  totals: { subtotal: 998, discount: 0, tax: 179.64, shipping: 49, total: 1226.64 },
};

describe('cartSlice', () => {
  it('starts empty', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.cartId).toBeNull();
    expect(state.items).toEqual([]);
  });

  it('stores the search query', () => {
    const state = reducer(undefined, setSearchQuery('mug'));
    expect(state.searchQuery).toBe('mug');
  });

  it('receives the cart returned by the API', () => {
    const state = reducer(undefined, loadCart.fulfilled(cart, 'request-1'));
    expect(state.cartId).toBe(7);
    expect(state.items).toHaveLength(1);
    expect(state.totals?.subtotal).toBe(998);
    expect(state.status).toBe('idle');
  });

  it('records API errors', () => {
    const state = reducer(
      undefined,
      addToCart.rejected(new Error('Product is out of stock'), 'request-2', { productId: 9 }),
    );
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Product is out of stock');
  });
});
