# ShopLite architecture

ShopLite is a small online store: a product catalogue, a cart with coupons,
and checkout. It is the practice project for the AI-Assisted Coding series.

```
Browser ──> web/ (React + Redux Toolkit, Vite dev server :5173)
               │  /api/* is proxied
               ▼
            api/ (Node 22, plain node:http, :4000)
               │
               ▼
            SQLite file  api/data/shoplite.db  (node:sqlite, no ORM)
```

## Repository map

| Path | What lives there |
|---|---|
| `api/src/server.ts` | Entry point: opens the DB, runs migrations, starts HTTP |
| `api/src/app.ts` | Builds the router and the request/response pipeline |
| `api/src/http/` | Tiny router, `HttpError`, input validation helpers |
| `api/src/routes/` | One file per resource: products, carts, orders, admin |
| `api/src/services/` | Business logic: pricing, carts, inventory |
| `api/src/integrations/` | Outside systems (sandbox payment client) |
| `api/src/db/` | Connection, migrations (`migrations/*.sql`), seed data |
| `api/src/lib/` | Logger and money helpers |
| `api/test/` | `node:test` tests; each file starts the API on a random port with an in-memory DB |
| `web/src/store/` | Redux Toolkit slices (`cartSlice.ts`, `productsSlice.ts`) and typed hooks |
| `web/src/components/` | React components |
| `web/src/design/tokens.ts` | Design tokens (see `docs/design-system.md`) |
| `scripts/` | `setup.ts` (env + DB), `dev.ts` (runs API and web together) |
| `tickets/` | Exported issue tracker tickets |
| `logs/app.log` | A sample of production logs |

## Request flow (checkout)

1. `web/src/components/Cart.tsx` dispatches `checkout()` from `cartSlice.ts`.
2. `POST /api/orders` → `api/src/routes/orders.ts`.
3. The route loads cart lines and active products, reserves stock
   (`services/inventory.ts`), prices the order (`services/pricing.ts`),
   charges the sandbox payment client and writes `orders` + `order_items`.

## Conventions

- **API**: TypeScript run directly by Node (type stripping). Use `.ts`
  extensions in imports and `import type` for types. No enums or
  parameter properties (Node can't strip them).
- Routes throw `HttpError(status, message)` for expected errors. Anything
  else becomes a 500 and is logged.
- All SQL is parameterised (`?` placeholders). Never build SQL from user input.
- Schema changes are new numbered files in `api/src/db/migrations/`.
  Never edit a migration that has already shipped.
- Money: see `docs/business-rules.md`.
- **Web**: use `useAppDispatch` / `useAppSelector` from `store/hooks.ts`;
  style with design tokens and the `<Button>` component.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs web dependencies and type definitions |
| `npm run setup` | Creates `.env` and the SQLite DB with seed data |
| `npm run setup -- --reset` | Rebuilds the DB from scratch |
| `npm run dev` | API on :4000 and web on :5173 |
| `npm test` | API tests (`node --test`) then web tests (Vitest) |
| `npm run test:api` | API tests only |
| `npm run typecheck` | TypeScript checks for both packages |
