# ShopLite

The practice project for the **AI-Assisted Coding** series (Claude Code + Cursor).

> ⚠️ **Training repo.** ShopLite contains deliberate bugs, gaps and security
> smells for the labs to find. All customer data is synthetic and every secret
> is fake. Don't copy this code into a real product.

## Quick start

You need **Node.js 22.18 or newer** (see `.nvmrc`) and Git.

```bash
npm install          # web dependencies + type definitions
npm run setup        # creates .env and the SQLite database with sample data
npm test             # API tests, then web tests
npm run dev          # API on http://localhost:4000, web on http://localhost:5173
```

The API has **no runtime dependencies**. It uses Node's built-in HTTP server,
SQLite (`node:sqlite`) and test runner (`node:test`), and Node runs the
TypeScript directly. There's nothing to install and no Docker.

## What's inside

| Path | What it is |
|---|---|
| `api/` | Node + TypeScript REST API on SQLite |
| `web/` | React + Redux Toolkit + Vite storefront |
| `docs/` | Architecture, business rules, API reference, design system |
| `tickets/` | Exported issue tracker tickets (SHOP-100 … SHOP-113) |
| `logs/app.log` | Three days of production-style API logs (~3,000 lines) |

Start with `docs/architecture.md`.

## Labs and checkpoints

The course labs (lab sheets, prompts and checks) live in a separate `labs/` folder
**next to** this folder, not inside it. Open only `shoplite/` in Claude Code or Cursor,
so the agent can't read the expected answers. Git tags mark where each lab starts and ends:

| Tag | State |
|---|---|
| `t1-start` | Fresh project (this is `main`) |
| `t1-end` / `t2-start` | After Topic 1: project context files (`AGENTS.md`, `CLAUDE.md`), `TAX_RATE` fixed |
| `t2-end` | After Topic 2: SHOP-101, 104 and 105 fixed, SHOP-103 investigation, SHOP-102 plan and API |

Jump to a checkpoint on a new branch so you can play freely:

```bash
git fetch --tags
git switch -c my-topic-2 t2-start
```

The reference solutions are on the `solutions` branch. Try the lab first.
