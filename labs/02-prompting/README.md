# Lab 2 · Prompt engineering

**Tools:** Claude Code (every prompt works the same in Cursor) · **Time:** about 75 minutes · **Starts at:** `t2-start`

```bash
git switch -c lab2/<your-name> t2-start   # cloned from GitHub? run `git fetch --tags` first
npm install && npm run setup && npm test     # everything green before you start
```

> If `npm test` fails with `Missing required environment variable TAX_RATE`, your `.env`
> was created before the Lab 1 fix. Add `TAX_RATE=0.18` to `.env`, or delete `.env` and run
> `npm run setup` again.

Prompting is the same skill in both tools, so this lab uses Claude Code only.
Every prompt in `prompts.md` works unchanged in Cursor if you prefer it.

## The 5-part prompt

| Part | Question it answers | Example (SHOP-113) |
|---|---|---|
| **ROLE** | Whose point of view? | Senior backend engineer on ShopLite |
| **GOAL** | What outcome, in one sentence? | Block checkout below the minimum order value |
| **CONTEXT** | Where in the system, what to read, what was decided? | Ticket, Finance's decision (₹299, after coupon), `orders.ts`, `carts.ts`, `config.ts` |
| **CONSTRAINTS** | What must not change? | API only, value in config, pricing/shipping/coupons untouched |
| **DONE WHEN** | How will we both know it worked? | Exact error text, `minimumOrderShortfall` on the cart, three named tests, suite green |

---

## Part A · Same ticket, two prompts (SHOP-113)

[SHOP-113](../../shoplite/tickets/SHOP-113.md) asks for a minimum order value, but the ticket
doesn't say what it is. Product and Finance have since agreed the rules. They're in
prompt 2.2, not in the repo, which is how it often goes in real teams.

`check-shop-113.mts` (in this folder) checks the six things they agreed and prints a
✓/✗ scorecard. It lives outside the repo so the agent can't read the answers. Run it from
Claude Code with `!`, which runs a shell command without asking the agent.

### A1. The "before" score

1. Open Claude Code in `shoplite/` and run:
   `!node ../labs/02-prompting/check-shop-113.mts`
   You should see **2 of 6**. The two that pass only check that normal orders still work.
2. `/clear`, so the agent hasn't seen the list of requirements.

### A2. Take 1: the vague prompt

1. Paste **prompt 2.1**: *"Add a minimum order value at checkout."*
2. It will probably stop and ask you questions first: the amount, whether a coupon counts,
   whether the web cart should warn. Reply **"Use your judgement and go ahead."**
   (If it shows clickable options, pick *Other* and type that.) That's what a vague
   prompt says, in effect.
3. When it's done, run the check again: `!node ../labs/02-prompting/check-shop-113.mts`.
   For each ✗, ask: *which fact was missing from my prompt?*
4. `/diff`. Its own tests pass. What exactly do they test?
5. **Esc Esc** (or `/rewind`), pick your take 1 prompt, and restore **code and conversation**.

### A3. Take 2: the 5-part prompt

1. Paste **prompt 2.2**.
2. Run the check: you should see **6 of 6**.
3. `/diff` and read it line by line. Then `/review` for a second opinion.

**What good looks like:**
- `minimumOrderValue: 299` in `api/src/config.ts`, and no `299` in the routes.
- Checkout compares `subtotal - discount` with the minimum **before** it reserves stock,
  and returns 400 with `Minimum order value is ₹299`.
- `GET /api/carts/:id` includes `minimumOrderShortfall` (49.5 for one ₹249.50 mug, 0 once met).
- New tests: below the minimum, exactly ₹299, and a coupon pushing an order below it.
- `pricing.ts` is untouched and `npm run test:api` passes.

**What we saw in rehearsal:** three runs of the vague prompt scored 2, 4 and 4 of 6. The agent
guessed ₹199 once and ₹299 twice, always measured the minimum *before* the coupon (copying the
shipping rule) and never added the cart field. Its own tests passed every time. Four runs of
the 5-part prompt all scored 6 of 6. Your numbers may differ, but the coupon and cart lines are
the ones a vague prompt can't get right: nothing in the repo says them.

Commit it.

### A4. Bonus: when a vague prompt works (SHOP-101)

1. `/clear`. Paste **prompt 2.10**: *"The order total is wrong when a coupon is applied. Fix it."*
2. It usually gets this right. Why? The right answer can be found: the ticket has the
   numbers, `docs/business-rules.md` has a worked example (₹1,108.88), and "tax goes on what
   the customer pays" is common knowledge. For SHOP-113 the answer exists only in Finance's
   heads until you write it down.
3. The rule of thumb: **a vague prompt works when the agent can find the answer, and fails
   when only you know it.** Topic 3 is about writing what your team knows into files once,
   so more answers become findable and your prompts get shorter.

**What good looks like:** GST on `subtotal - discount`, every amount through `roundMoney()`,
a test for the worked example (total 1108.88), shipping untouched. Commit it.

---

## Part B · Habit 1: investigate first. Habit 2: plan before you build.

### B1. Investigate SHOP-103 (read-only)

1. `/clear`, then Shift+Tab to **⏸ plan mode**. Claude can read files and explore, but
   can't edit anything until you approve a plan.
2. Paste **prompt 2.3**.
3. Open one `file:line` the report cites and check it yourself. Is the evidence right?

**What good looks like:** it finds all of these, each with a file:line reference:
- `POST /api/carts/:id/items` only checks `stock <= 0`, not the requested quantity or what's already in the cart.
- `PATCH /api/carts/:id/items/:productId` has no stock check at all.
- `reserveStock()` decrements without checking that enough stock is left.
- Checkout isn't in a transaction: stock is taken before payment and before the order is written,
  so a failure halfway leaves stock reduced.

It should also say what it's unsure about. Keep the report: copy it into `docs/investigations/SHOP-103.md`.

### B2. Plan SHOP-102 (wishlist)

1. Still in plan mode. `/clear`, paste **prompt 2.4**.
2. Read the plan. **Edit it before approving.** For example, reply:
   *"Change step 1: migration and API only, web in a separate PR. Use 404 for an unknown product.
   Add a test for adding the same product twice."*
3. When the plan is right, approve it with the instruction *"Only save this plan to
   `docs/plans/SHOP-102-wishlist.md`, then stop."* Approving a plan switches Claude out of
   plan mode, so say explicitly that it must not start building.

---

## Part C · Habit 3: exact files. Habit 4: alternatives. Habit 5: stop points.

### C1. Ask for alternatives (SHOP-105)

1. `/clear`, plan mode. Paste **prompt 2.5**.
2. You should get: the root cause (the stale "hero banner" offset `- 1`, plus no tie-breaker
   in `ORDER BY`), then a comparison table of 2–3 options and a recommendation.
3. Push back on one point to see how it reasons: *"What if the web must keep 'Page X of Y'?"*

### C2. Implement with stop points

1. Shift+Tab to **⏸ manual mode**. Paste **prompt 2.6**.
2. It must stop after step 1. Run `/diff` and read the new test before saying "go".
3. Practise undo: `Esc Esc` → rewind to before step 1 → restore the code → ask again
   with a tighter instruction.

### C3. Exact file references

Ask the same question two ways and compare what it reads (watch the tool calls):
- *"Where is the paging logic?"*
- *"Explain the offset calculation in @api/src/routes/products.ts"*

The second one reads one file. The first one searches. Both work, but one costs more time
and context, and that gap grows with the size of the codebase.

---

## Part D · Advanced patterns

### D1. Test first (SHOP-104)

1. `/clear`, manual mode. Paste **prompt 2.7**. It writes a failing test and **stops**.
   Check it fails for the right reason (shipping is 49 at exactly 999).
2. Paste **prompt 2.8**. The fix should be one character (`>` → `>=`).

### D2. Let it interview you (SHOP-112)

1. `/clear`. Paste **prompt 2.9**.
2. Answer its questions in one or two sentences each. Notice which questions changed the design.
3. It writes `docs/specs/SHOP-112-loyalty.md`. No code.

### D3. Steer or restart?

| Situation | Do this |
|---|---|
| Right direction, small mistake | Steer: "Keep that, but use roundMoney instead of toFixed." |
| Wrong direction after 2 corrections | `/clear` and write a better prompt |
| It misread the task | Esc, rewind to before the misread, restate the goal |
| Context full of failed attempts | `/clear`. Old attempts keep pulling it back |

---

## Anti-patterns to avoid

- Pasting whole files or logs instead of pointing at them (`@file`)
- Three tasks in one prompt
- "Make it better", "clean this up" (better how? done when?)
- No DONE WHEN, so the agent decides when it's finished
- Accepting a diff you haven't read
