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

  it('SHOP-105: page numbers show every active product exactly once', async () => {
    const seen: number[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await server.request('GET', `/api/products?page=${page}&pageSize=10`);
      assert.equal(res.status, 200);
      seen.push(...res.body.items.map((p: { id: number }) => p.id));
    }
    assert.equal(seen.length, 28);
    assert.equal(new Set(seen).size, 28);
  });

  it('SHOP-105: the cursor feed walks every active product exactly once', async () => {
    const seen: number[] = [];
    let cursor: string | null = null;
    do {
      const query: string = cursor ? `&cursor=${cursor}` : '';
      const res = await server.request('GET', `/api/products/feed?limit=8${query}`);
      assert.equal(res.status, 200);
      seen.push(...res.body.items.map((p: { id: number }) => p.id));
      cursor = res.body.nextCursor;
    } while (cursor);
    assert.equal(seen.length, 28);
    assert.equal(new Set(seen).size, 28);
  });

  it('SHOP-105: a product added mid-scroll does not shift the cursor feed', async () => {
    const first = await server.request('GET', '/api/products/feed?limit=5');
    server.db
      .prepare(
        "INSERT INTO products (sku, name, category_id, price, stock, active, created_at) VALUES ('T-NEW', 'Brand New Product', 2, 999, 5, 1, '2026-12-31T00:00:00.000Z')",
      )
      .run();
    const second = await server.request('GET', `/api/products/feed?limit=5&cursor=${first.body.nextCursor}`);
    const firstIds = new Set(first.body.items.map((p: { id: number }) => p.id));
    assert.ok(second.body.items.every((p: { id: number }) => !firstIds.has(p.id)));
  });

  it('rejects a tampered cursor', async () => {
    const res = await server.request('GET', '/api/products/feed?cursor=not-a-cursor');
    assert.equal(res.status, 400);
  });
});
