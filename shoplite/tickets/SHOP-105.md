# SHOP-105 · Catalogue paging repeats and hides products

| Field | Value |
|---|---|
| Type | Bug + design decision |
| Priority | High |
| Reporter | Merchandising (Kavya) |
| Status | Open |
| Labels | catalogue, api |

## Part 1: bug

- Page 2 of the catalogue starts with the same product that ended page 1.
- Our best-seller, **Cotton Crew T-Shirt**, doesn't appear on any page,
  although searching for "t-shirt" finds it.

## Part 2: decision needed

**Arjun (Mobile lead):** The mobile app is moving to infinite scroll and the
catalogue is expected to grow to ~50,000 products next year. Before we fix the
paging, can we decide whether to stay with page numbers (`?page=`) or move to
cursor/keyset paging? The web still shows "Page X of Y".

Please give us the options and the trade-offs before anyone writes code.
