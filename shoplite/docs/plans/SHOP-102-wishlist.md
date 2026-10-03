# SHOP-102 · Wishlist: implementation plan

*Reference answer for Lab 2, Part B2. Step 1 is implemented on `t2-end`; step 2 is left for later.*

## Data

New migration `api/src/db/migrations/002_wishlist.sql`:

```sql
CREATE TABLE wishlist_items (
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  created_at   TEXT NOT NULL,
  PRIMARY KEY (customer_id, product_id)   -- one row per product, so "add twice" is a no-op
);
```

## API (`api/src/routes/wishlist.ts`)

| Method | Path | Response |
|---|---|---|
| GET | `/api/customers/:customerId/wishlist` | `{ customerId, items: [{ productId, name, price, inStock }] }` |
| PUT | `/api/customers/:customerId/wishlist/:productId` | Same body. Idempotent |
| DELETE | `/api/customers/:customerId/wishlist/:productId` | Same body |

- 404 for unknown customer, or unknown/discontinued product on PUT.
- Discontinued products are filtered out of GET; their rows stay (analytics).

## Steps

1. **Migration + API + tests** (`api/test/wishlist.test.ts`): empty list, add twice → one row,
   remove, discontinued hidden but row kept, 404s. Update `docs/api.md`.
2. **Web** (separate PR): `wishlistSlice.ts` with thunks; heart toggle on `ProductCard` using
   `<Button variant="link">` and tokens; a "Saved" list under the cart. Needs a customer id; until
   auth exists, read it from a dev-only setting.

## Open questions for Product

1. Guests: hide the heart, or prompt to sign in?
2. Should moving an item to the cart remove it from the wishlist?
3. Any limit on wishlist size?
