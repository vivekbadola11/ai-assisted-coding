import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer, type TestServer } from './helpers.ts';

describe('products API', () => {
  let server: TestServer;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('lists active products, newest first', async () => {
    const res = await server.request('GET', '/api/products');
    assert.equal(res.status, 200);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.items.length, 20);
    assert.equal(res.body.total, 28); // 29 fixture products, one discontinued
    assert.equal(res.body.items[0].name, 'Filler Product 29');
  });

  it('filters by search text', async () => {
    const res = await server.request('GET', '/api/products?q=mug');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.items.map((p: { name: string }) => p.name),
      ['Ceramic Coffee Mug'],
    );
  });

  it('returns one product by id', async () => {
    const res = await server.request('GET', '/api/products/1');
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'Cotton Crew T-Shirt');
    assert.equal(res.body.inStock, true);
  });

  it('hides discontinued products', async () => {
    const res = await server.request('GET', '/api/products/3');
    assert.equal(res.status, 404);
  });

  it('rejects a non-numeric page', async () => {
    const res = await server.request('GET', '/api/products?page=abc');
    assert.equal(res.status, 400);
  });
});
