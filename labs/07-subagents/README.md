# Lab 7 · Subagents (outline)

> **Status: outline.** The full lab sheet and prompts are written with the Topic 7 recording.

**Tools:** Claude Code (`.claude/agents/`) · **Starts at:** `t7-start`

## Goal

Delegate noisy or specialist work to subagents with their own context and
permissions, and keep the main conversation clean.

## Assets already in the repo

| Specialist | Job in ShopLite | Ticket |
|---|---|---|
| SQL specialist (read-only) | Find the N+1 query behind order history | SHOP-108 |
| Log analyst | Read `logs/app.log`, return only the findings | SHOP-109 |
| API specialist | Trace checkout from `Cart.tsx` → `POST /api/orders` → DB | SHOP-103 / 109 |
| Design specialist | Audit components against `docs/design-system.md` | SHOP-110 |

## Planned exercises

1. Create the four agents in `.claude/agents/` with narrow tool lists (the SQL and log agents can't edit).
2. Run SHOP-109 with and without the log analyst, and compare `/context` in the main session.
3. Chain them: log analyst finds the failing carts → SQL specialist confirms which products →
   API specialist proposes the fix.
