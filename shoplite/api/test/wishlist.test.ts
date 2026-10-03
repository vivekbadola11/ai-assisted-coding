import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer, type TestServer } from './helpers.ts';

describe('wishlist API (SHOP-102)', () => {
  let server: TestServer;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('starts empty', async () => {
    const res = await server.request('GET', '/api/customers/1/wishlist');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.items, []);
  });

  it('adds a product once, even if added twice', async () => {
    await server.request('PUT', '/api/customers/1/wishlist/2');
    const res = await server.request('PUT', '/api/customers/1/wishlist/2');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.items, [{ productId: 2, name: 'Steel Water Bottle 1L', price: 349, inStock: true }]);
  });

  it('removes a product', async () => {
    await server.request('PUT', '/api/customers/1/wishlist/4');
    const res = await server.request('DELETE', '/api/customers/1/wishlist/4');
    assert.equal(res.status, 200);
    assert.ok(res.body.items.every((item: { productId: number }) => item.productId !== 4));
  });

  it('hides products discontinued after they were saved, but keeps the row', async () => {
    await server.request('PUT', '/api/customers/1/wishlist/1');
    server.db.prepare('UPDATE products SET active = 0 WHERE id = 1').run();
    const res = await server.request('GET', '/api/customers/1/wishlist');
    assert.ok(res.body.items.every((item: { productId: number }) => item.productId !== 1));
    const row = server.db.prepare('SELECT 1 AS kept FROM wishlist_items WHERE customer_id = 1 AND product_id = 1').get();
    assert.deepEqual({ ...row }, { kept: 1 });
  });

  it('rejects unknown customers and discontinued products', async () => {
    assert.equal((await server.request('GET', '/api/customers/999/wishlist')).status, 404);
    assert.equal((await server.request('PUT', '/api/customers/1/wishlist/3')).status, 404);
  });
});
