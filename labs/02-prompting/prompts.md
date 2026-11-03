# Lab 2 prompts

## 2.1 · Take 1: vague (on purpose)

```
Add a minimum order value at checkout.
```

## 2.2 · Take 2: the 5-part prompt

```
ROLE: You are a senior backend engineer on ShopLite.

GOAL: Implement SHOP-113: block checkout below the minimum order value.

CONTEXT:
- Ticket: @tickets/SHOP-113.md
- Agreed with Finance (not in the ticket yet): the minimum is ₹299,
  measured on subtotal minus coupon discount, before GST and shipping.
  An order of exactly ₹299 is allowed.
- Checkout: @api/src/routes/orders.ts · Cart: @api/src/services/carts.ts
- Config: @api/src/config.ts · Tests: api/test/ (npm run test:api)

CONSTRAINTS:
- API only. Put 299 in config as minimumOrderValue, not in routes.
- Don't change pricing, shipping or coupon rules. Only add response fields.

DONE WHEN:
- Checkout below the minimum returns 400 "Minimum order value is ₹299".
- GET /api/carts/:id includes minimumOrderShortfall (₹ still missing, 0 when met).
- Tests: below the minimum, exactly ₹299, and a coupon pushing it below.
- npm run test:api passes. Show me the test output and the diff.
```

## 2.3 · Investigate first (SHOP-103)

```
Investigate @tickets/SHOP-103.md. Do not edit any files.

Trace every code path that changes stock or cart quantity: adding to the cart,
changing quantity, and checkout.

Report:
1. Each root cause, with file:line evidence
2. How to reproduce each one with API calls
3. Anything you are not sure about

Stop after the report.
```

## 2.4 · Plan before implementing (SHOP-102)

```
We need to build @tickets/SHOP-102.md. Plan only. No code yet.

Read @docs/architecture.md and follow its conventions (migrations, routes, tests, Redux hooks).

The plan must include:
- The database migration: file name and SQL
- API endpoints, with an example request and response for each
- Web changes: slice, components
- Tests to add
- The order of work as small steps, each one testable on its own
- Open questions for Product
```
