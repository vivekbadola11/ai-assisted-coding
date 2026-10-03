import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer, type TestServer } from './helpers.ts';

describe('carts API', () => {
  let server: TestServer;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('creates an empty cart', async () => {
    const res = await server.request('POST', '/api/carts', { customerId: 1 });
    assert.equal(res.status, 201);
    assert.equal(res.body.customerId, 1);
    assert.deepEqual(res.body.items, []);
    assert.equal(res.body.totals.subtotal, 0);
  });

  it('adds items and merges quantities for the same product', async () => {
    const cart = (await server.request('POST', '/api/carts')).body;
    await server.request('POST', `/api/carts/${cart.id}/items`, { productId: 1, quantity: 1 });
    const res = await server.request('POST', `/api/carts/${cart.id}/items`, { productId: 1, quantity: 2 });
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 1);
    assert.equal(res.body.items[0].quantity, 3);
    assert.equal(res.body.totals.subtotal, 1497);
  });

  it('refuses discontinued products', async () => {
    const cart = (await server.request('POST', '/api/carts')).body;
    const res = await server.request('POST', `/api/carts/${cart.id}/items`, { productId: 3 });
    assert.equal(res.status, 404);
  });

  it('applies a valid coupon and rejects an inactive one', async () => {
    const cart = (await server.request('POST', '/api/carts')).body;
    await server.request('POST', `/api/carts/${cart.id}/items`, { productId: 1, quantity: 2 });

    const ok = await server.request('POST', `/api/carts/${cart.id}/coupon`, { code: 'save10' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.couponCode, 'SAVE10');

    const expired = await server.request('POST', `/api/carts/${cart.id}/coupon`, { code: 'EXPIRED5' });
    assert.equal(expired.status, 404);
  });

  it('removes an item', async () => {
    const cart = (await server.request('POST', '/api/carts')).body;
    await server.request('POST', `/api/carts/${cart.id}/items`, { productId: 4 });
    const res = await server.request('DELETE', `/api/carts/${cart.id}/items/4`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.items, []);
  });
});
