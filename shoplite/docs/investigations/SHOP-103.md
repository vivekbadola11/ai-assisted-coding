# SHOP-103 investigation: how stock goes wrong

*Reference answer for Lab 2, Part B1. Produced read-only; no code was changed.*

## Root causes

| # | Where | What happens |
|---|---|---|
| 1 | `api/src/routes/carts.ts:34` | Adding to the cart only checks `stock <= 0`. It ignores the requested quantity, so 5 bottles can be added when 3 are in stock. |
| 2 | `api/src/routes/carts.ts:38` | The `ON CONFLICT … quantity + excluded.quantity` merge adds to what's already in the cart without any stock check, so repeated adds grow past stock. |
| 3 | `api/src/routes/carts.ts:45-51` | `PATCH /api/carts/:id/items/:productId` sets any positive quantity. No stock check at all. |
| 4 | `api/src/services/inventory.ts:5` | `reserveStock()` runs `UPDATE … SET stock = stock - ?` with no `AND stock >= ?` guard and never checks `changes`, so it happily goes negative. |
| 5 | `api/src/routes/orders.ts:65-74` | Checkout isn't a transaction. Stock is reserved (line 65) **before** payment (line 70) and before the order row is written (line 74). If payment or the insert fails, the stock stays reduced: the "failed halfway" case from the ticket. |

## Reproduce (seed data, product 25 has stock 3)

```bash
CART=$(curl -s -X POST localhost:4000/api/carts | jq .id)
curl -s -X POST localhost:4000/api/carts/$CART/items -H 'content-type: application/json' -d '{"productId":25,"quantity":5}'
curl -s -X POST localhost:4000/api/orders -H 'content-type: application/json' -d "{\"cartId\":$CART}"
curl -s localhost:4000/api/products/25 | jq .stock     # -2
```

## Not sure about

- Whether two checkouts can interleave today. `node:sqlite` is synchronous, but the handler
  `await`s the payment call between reserving and writing the order, so another request can run in that gap.
- Whether the business wants the cart to block at add time or only at checkout. `docs/business-rules.md`
  only says stock must never go negative and checkout is all-or-nothing.

## Suggested fix (for a separate change)

Conditional update (`WHERE id = ? AND stock >= ?`, fail if `changes = 0`), wrap reservation and
order insert in one transaction, check quantity against stock on add/patch, and release stock if
payment fails.
