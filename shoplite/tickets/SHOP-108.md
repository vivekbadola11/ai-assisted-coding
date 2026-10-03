# SHOP-108 · Order history is slow for regular customers

| Field | Value |
|---|---|
| Type | Performance |
| Priority | Medium |
| Reporter | Support (Neha) |
| Status | Open |
| Labels | api, database |

## Description

The order history page is slow for our most loyal customers. Customer 12 has
more than 40 orders and the page takes noticeably longer than for new customers.
The production logs show `slow request` warnings for `GET /api/orders`.

Can someone look at the queries behind `GET /api/orders?customerId=` and
suggest a fix? Read-only analysis first, please: this runs against the main database.
