# ShopLite: instructions for coding agents

Small online store: Node + TypeScript API on SQLite (`api/`), React + Redux Toolkit web app (`web/`).
Training repo: some bugs are deliberate and tracked in `tickets/`.

## Commands

- `npm install`: web dependencies and type definitions (needs Node 22.18+, see `.nvmrc`)
- `npm run setup`: create `.env` and the SQLite DB; `npm run setup -- --reset` rebuilds the DB
- `npm run dev`: API on :4000 and web on :5173
- `npm test`: all tests · `npm run test:api`: API only · `npm run test:web`: web only
- One API test file: `cd api && node --disable-warning=ExperimentalWarning --test test/pricing.test.ts`
- `npm run typecheck`: TypeScript checks for both packages

## Where things are

- `api/src/routes/`: one file per resource; register new routes in `api/src/app.ts`
- `api/src/services/`: business logic (pricing, carts, inventory)
- `api/src/db/migrations/`: numbered SQL files
- `api/test/`: `node:test` tests; use `startTestServer()` from `test/helpers.ts`
- `web/src/store/`: Redux slices; `web/src/components/`: React components
- `docs/`: start with `architecture.md`; rules in `business-rules.md`; endpoints in `api.md`

## Conventions that aren't obvious from the code

- Node runs the API's TypeScript directly: import with `.ts` extensions, use `import type`
  for types, no enums or constructor parameter properties.
- Routes throw `HttpError(status, message)` for expected errors.
- SQL is always parameterised (`?`). Schema changes = a new migration file; never edit a shipped one.
- Money: round every amount with `roundMoney()` from `api/src/lib/money.ts`. Rules in `docs/business-rules.md`.
- Web: use `useAppDispatch` / `useAppSelector`; style with `web/src/design/tokens.ts` and `<Button>`.
- Add or update a test with every behaviour change, and run `npm run test:api` before saying you're done.

## Don't

- Don't change shipping or pricing rules without a ticket that says so.
- Don't commit `.env` or anything in `api/data/`.
