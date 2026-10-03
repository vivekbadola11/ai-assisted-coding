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

## 2.5 · Ask for alternatives (SHOP-105)

```
Read @tickets/SHOP-105.md and @api/src/routes/products.ts.

Part 1: Explain the root cause of the paging bug in 3–4 sentences. Don't fix it yet.

Part 2: Give me 2–3 options for pagination going forward. For each one cover:
how it works, the API shape, the effect on the web's "Page X of Y" and on mobile
infinite scroll, performance at 50,000 products, what happens when products are
added while someone is paging, and the effort.

Put the comparison in a table, recommend one, and tell me what would change your mind.
No code.
```

## 2.6 · Implement with stop points (SHOP-105)

```
Implement the paging fix in steps. Stop after each step and wait for me to say "go".

Step 1: Fix the offset calculation and add a stable tie-breaker to ORDER BY.
        Add a test that walks every page and checks each active product appears exactly once.
        Run npm run test:api. STOP and show me the diff.

Step 2: Add the option we chose for the mobile app, without breaking ?page= for the web.
        Update docs/api.md. Run the tests. STOP.

If any step needs a change to the response shape existing clients use, stop and ask me first.
```

## 2.7 · Test first: failing test only (SHOP-104)

```
@tickets/SHOP-104.md

Write ONE failing test in api/test/pricing.test.ts that shows a ₹999.00 subtotal is
charged shipping, even though docs/business-rules.md says it should be free.
Run it and show me it fails for that reason. Do not change any other code. Stop.
```

## 2.8 · Test first: the fix

```
Now make the smallest change that makes that test pass. Don't touch anything else.
Run the full API test suite and show me the result.
```

## 2.9 · Let it interview you (SHOP-112)

```
Read @tickets/SHOP-112.md. It's vague on purpose.

Before proposing anything, interview me. Ask up to 5 questions, one at a time,
starting with the decision that would change the design the most.

After my answers, write a one-page spec to docs/specs/SHOP-112-loyalty.md with:
goal, rules, data model sketch, API sketch, out of scope, open questions.
Don't write code.
```

## 2.10 · Bonus: vague, but the repo knows (SHOP-101)

```
The order total is wrong when a coupon is applied. Fix it.
```
