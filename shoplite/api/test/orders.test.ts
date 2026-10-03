import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer, type TestServer } from './helpers.ts';

describe('orders API', () => {
  let server: TestServer;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  async function cartWith(items: { productId: number; quantity: number }[]) {
    const cart = (await server.request('POST', '/api/carts', { customerId: 1 })).body;
    for (const item of items) await server.request('POST', `/api/carts/${cart.id}/items`, item);
    return cart.id as number;
  }

  it('checks out a cart, records the order and reduces stock', async () => {
    const cartId = await cartWith([{ productId: 4, quantity: 2 }]);
    const res = await server.request('POST', '/api/orders', { cartId });
    assert.equal(res.status, 201);
    assert.equal(res.body.customerId, 1);
    assert.equal(res.body.items.length, 1);
    assert.match(res.body.paymentReference, /^pay_/);

    const product = server.db.prepare('SELECT stock FROM products WHERE id = 4').get() as { stock: number };
    assert.equal(product.stock, 18);
  });

  it('will not check out the same cart twice', async () => {
    const cartId = await cartWith([{ productId: 1, quantity: 1 }]);
    assert.equal((await server.request('POST', '/api/orders', { cartId })).status, 201);
    assert.equal((await server.request('POST', '/api/orders', { cartId })).status, 409);
  });

  it('rejects an empty cart', async () => {
    const cartId = await cartWith([]);
    const res = await server.request('POST', '/api/orders', { cartId });
    assert.equal(res.status, 400);
  });

  describe('minimum order value (SHOP-113)', () => {
    before(() => {
      server.db
        .prepare(
          "INSERT INTO products (id, sku, name, category_id, price, stock, active, created_at) VALUES (900, 'T-900', 'Gift Box', 2, 299, 10, 1, '2026-01-05T00:00:00.000Z')",
        )
        .run();
    });

    it('refuses an order below ₹299 and takes no stock', async () => {
      const cartId = await cartWith([{ productId: 4, quantity: 1 }]); // ₹249.50
      const res = await server.request('POST', '/api/orders', { cartId });
      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'Minimum order value is ₹299');

      const product = server.db.prepare('SELECT stock FROM products WHERE id = 4').get() as { stock: number };
      assert.equal(product.stock, 18, 'stock is unchanged since the first test');
    });

    it('accepts an order of exactly ₹299', async () => {
      const cartId = await cartWith([{ productId: 900, quantity: 1 }]);
      const res = await server.request('POST', '/api/orders', { cartId });
      assert.equal(res.status, 201);
    });

    it('counts the coupon: ₹318 with SAVE10 is ₹286.20 and is refused', async () => {
      const cartId = await cartWith([
        { productId: 5, quantity: 1 },
        { productId: 6, quantity: 1 },
        { productId: 7, quantity: 1 },
      ]);
      await server.request('POST', `/api/carts/${cartId}/coupon`, { code: 'SAVE10' });
      const res = await server.request('POST', '/api/orders', { cartId });
      assert.equal(res.status, 400);
    });
  });

  it('lists a customer’s orders with their items', async () => {
    const res = await server.request('GET', '/api/orders?customerId=1');
    assert.equal(res.status, 200);
    assert.ok(res.body.orders.length >= 2);
    assert.ok(res.body.orders.every((o: { items: unknown[] }) => o.items.length > 0));
  });
});
