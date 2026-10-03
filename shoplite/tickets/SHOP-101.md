# SHOP-101 · Order total is wrong when a coupon is applied

| Field | Value |
|---|---|
| Type | Bug |
| Priority | High |
| Reporter | Customer Support (Neha) |
| Status | Open |
| Labels | pricing, checkout |

## Description

Several customers say they were charged more than the invoice they expected
when they used a coupon. Finance confirmed the amounts don't match our pricing rules.

## Steps to reproduce

1. Add 2 × Cotton Crew T-Shirt (₹499 each) to a cart.
2. Apply coupon `SAVE10`.
3. Look at the cart totals (or `GET /api/carts/2` with the seed data).

## Expected

Subtotal ₹998.00, discount ₹99.80, GST ₹161.68, shipping ₹49.00, **total ₹1,108.88**
(see the worked example in `docs/business-rules.md`).

## Actual

GST shows ₹179.64 and the total is ₹1,126.84. The API also returns values such
as `"total": 1126.8400000000001`.

## Comments

**Ravi (Finance):** Orders without a coupon look right. It's only coupon orders.

**Neha (Support):** Please don't change anything about shipping in this fix,
there's a separate ticket for the ₹999 edge case (SHOP-104).
