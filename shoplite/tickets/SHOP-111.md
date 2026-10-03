# SHOP-111 · Categories endpoint for the new filter bar

| Field | Value |
|---|---|
| Type | Feature |
| Priority | Medium |
| Reporter | Web team (Rohan) |
| Status | Ready |

## Description

The web app is getting a category filter bar. It needs:

`GET /api/categories` → `[{ "slug": "kitchen", "name": "Kitchen", "productCount": 12 }, …]`

- Count only active products.
- Sort by name.
- Add it to `docs/api.md` and cover it with a test.
