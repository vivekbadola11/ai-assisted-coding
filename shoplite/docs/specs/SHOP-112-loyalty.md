# SHOP-112 · Loyalty points: one-page spec

*Example output for Lab 2, Part D2. Your answers to the interview will differ, so your spec will too.*

**Interview answers used:** points on what the customer pays for goods (after discount, before GST
and shipping); 1 point per ₹100; points expire after 12 months; 100 points = ₹10 off;
redeem at checkout only, up to 50% of the subtotal; no tiers for now.

## Goal

Reward repeat customers and give them a reason to come back within a year.

## Rules

- Earn `floor((subtotal − discount) / 100)` points per paid order, credited when the order is placed.
- Points expire 12 months after they were earned (oldest first).
- Redeem in blocks of 100 points = ₹10, at checkout, up to 50% of the subtotal.
- Redeemed value reduces the amount GST is charged on (treated like a discount).
- Cancelled orders reverse the points they earned.

## Data model sketch

`loyalty_ledger(id, customer_id, order_id, points, reason ['earn'|'redeem'|'expire'|'reverse'], expires_at, created_at)`.
Balance = sum of non-expired rows. A ledger, not a balance column, so every change is auditable.

## API sketch

- `GET /api/customers/:id/loyalty` → `{ balance, expiringSoon: [{ points, expiresAt }] }`
- `POST /api/carts/:id/loyalty { points }` → cart with a `loyaltyDiscount` line in totals

## Out of scope

Tiers, partner points, points for reviews or referrals, a points history page.

## Open questions

1. Can points and a coupon be combined in one order?
2. Who approves manual point adjustments by Support?
