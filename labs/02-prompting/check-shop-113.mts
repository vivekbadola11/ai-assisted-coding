/**
 * SHOP-113 acceptance check: what Product and Finance actually agreed.
 *
 * Run it from inside the shoplite folder (no server needed):
 *   node ../labs/02-prompting/check-shop-113.mts
 * or from Claude Code:
 *   !node ../labs/02-prompting/check-shop-113.mts
 *
 * It starts the API with an in-memory test database, tries real checkouts and
 * prints one line per requirement. Keep this file outside the shoplite folder so
 * the agent can't read the answers.
 */
process.removeAllListeners('warning'); // hide Node's experimental SQLite warning

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = resolve(process.argv[2] ?? process.cwd());
const { startTestServer } = await import(pathToFileURL(resolve(repo, 'api/test/helpers.ts')).href);

const server = await startTestServer();
const insert = server.db.prepare(
  "INSERT INTO products (id, sku, name, category_id, price, stock, active, created_at) VALUES (?, ?, ?, 1, ?, 50, 1, '2026-01-10T00:00:00.000Z')",
);
insert.run(900, 'CHK-299', 'Check item at ₹299', 299);
insert.run(901, 'CHK-320', 'Check item at ₹320', 320);

type Line = { productId: number; quantity: number };

async function cartWith(lines: Line[], coupon?: string): Promise<number> {
  const cart = (await server.request('POST', '/api/carts', { customerId: 1 })).body;
  for (const line of lines) await server.request('POST', `/api/carts/${cart.id}/items`, line);
  if (coupon) await server.request('POST', `/api/carts/${cart.id}/coupon`, { code: coupon });
  return cart.id;
}

const MUG = { productId: 4, quantity: 1 }; // ₹249.50
const results: { name: string; ok: boolean; detail: string }[] = [];

async function check(name: string, run: () => Promise<{ ok: boolean; detail: string }>) {
  try {
    results.push({ name, ...(await run()) });
  } catch (err) {
    results.push({ name, ok: false, detail: err instanceof Error ? err.message : String(err) });
  }
}

await check('Blocks a ₹249.50 order (below ₹299)', async () => {
  const res = await server.request('POST', '/api/orders', { cartId: await cartWith([MUG]) });
  return { ok: res.status === 400, detail: `got ${res.status}` };
});

await check('Error says "Minimum order value is ₹299"', async () => {
  const res = await server.request('POST', '/api/orders', { cartId: await cartWith([MUG]) });
  const error = String(res.body?.error ?? '');
  return { ok: res.status === 400 && error.includes('Minimum order value is ₹299'), detail: error ? `"${error}"` : `got ${res.status}, no error` };
});

await check('Allows an order of exactly ₹299', async () => {
  const res = await server.request('POST', '/api/orders', { cartId: await cartWith([{ productId: 900, quantity: 1 }]) });
  return { ok: res.status === 201, detail: `got ${res.status}${res.body?.error ? ` "${res.body.error}"` : ''}` };
});

await check('Counts the coupon: ₹320 − 10% is blocked', async () => {
  const res = await server.request('POST', '/api/orders', { cartId: await cartWith([{ productId: 901, quantity: 1 }], 'SAVE10') });
  return { ok: res.status === 400, detail: `got ${res.status}` };
});

await check('Cart shows minimumOrderShortfall: 49.5', async () => {
  const res = await server.request('GET', `/api/carts/${await cartWith([MUG])}`);
  const value = res.body?.minimumOrderShortfall;
  return { ok: value === 49.5, detail: value === undefined ? 'field missing' : `got ${JSON.stringify(value)}` };
});

await check('A normal ₹499 order still checks out', async () => {
  const res = await server.request('POST', '/api/orders', { cartId: await cartWith([{ productId: 1, quantity: 1 }]) });
  return { ok: res.status === 201, detail: `got ${res.status}${res.body?.error ? ` "${res.body.error}"` : ''}` };
});

await server.close();

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
console.log('\nSHOP-113 acceptance check\n');
for (const r of results) {
  console.log(`  ${r.ok ? green('✓') : red('✗')}  ${r.name}${r.ok ? '' : `   (${r.detail})`}`);
}
const passed = results.filter((r) => r.ok).length;
const summary = `${passed} of ${results.length} requirements met`;
console.log(`\n  ${passed === results.length ? green(summary) : red(summary)}\n`);
