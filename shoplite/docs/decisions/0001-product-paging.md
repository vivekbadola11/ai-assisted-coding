# 0001 · Product paging: keep page numbers for web, add a cursor feed for mobile

*Status: accepted (SHOP-105). Reference answer for Lab 2, Part C.*

## Context

`GET /api/products?page=` skipped back one item on later pages (a leftover offset from a removed
hero banner) and sorted only by `created_at`, which has ties. The mobile app wants infinite scroll,
and the catalogue may reach ~50,000 products.

## Options

| | Offset paging (`?page=`) | Keyset / cursor (`?cursor=`) | Hybrid |
|---|---|---|---|
| How | `LIMIT n OFFSET (page-1)*n` | `WHERE (created_at, id) < cursor LIMIT n` | Both endpoints |
| Web "Page X of Y" | ✅ natural | ❌ no page numbers | ✅ |
| Mobile infinite scroll | ⚠️ works, but shifts when products are added | ✅ stable | ✅ |
| Cost at page 2,500 of 50k | ❌ scans and discards every earlier row | ✅ index seek | ✅ for mobile |
| Products added while paging | ❌ duplicates / skips | ✅ none | ✅ for mobile |
| Effort | Fix only | New contract for clients | Fix + one endpoint |

## Decision

**Hybrid.** Fix offset paging (correct offset, `ORDER BY created_at DESC, id DESC`) so the web
keeps "Page X of Y", and add `GET /api/products/feed?limit=&cursor=` for infinite scroll.
The cursor is opaque (base64url of `[created_at, id]`).

## What would change this

If the web drops page numbers, retire `?page=`. If the feed needs search and category filters,
add them to the feed and an index on `(active, created_at, id)`.
