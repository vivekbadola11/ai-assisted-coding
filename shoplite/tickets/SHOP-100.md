# SHOP-100 · Health-check endpoint for the load balancer

| Field | Value |
|---|---|
| Type | Task |
| Priority | Medium |
| Reporter | Platform team (Imran) |
| Status | Open |

## Description

The new load balancer needs an endpoint it can poll every 10 seconds to decide
whether an API instance is healthy.

## Acceptance criteria

- `GET /api/health` returns `200` with `{ "status": "ok", "db": "ok" }` when the
  database answers a trivial query.
- If the database query fails, return `503` with `{ "status": "error", "db": "error" }`.
- No authentication. No customer data in the response.
- Covered by a test in `api/test/`.
