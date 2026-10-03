# SHOP-102 · Wishlist

| Field | Value |
|---|---|
| Type | Feature |
| Priority | Medium |
| Reporter | Product (Ananya) |
| Status | Ready for planning |

## Description

Signed-in customers want to save products for later.

## Requirements

- A customer can add a product to their wishlist and remove it.
- A customer can see their wishlist (product name, price, in stock or not).
- Adding the same product twice keeps one entry.
- Discontinued products drop off the wishlist view (but we keep the row for analytics).
- Product cards show a heart that is filled when the product is on the wishlist.

## Out of scope

- Sharing wishlists, price-drop alerts, guest wishlists.

## Notes

**Ananya:** We don't have real auth yet. For now pass `customerId` like the
orders endpoint does. Please plan this before anyone writes code: it touches
the DB, the API and the web app.
