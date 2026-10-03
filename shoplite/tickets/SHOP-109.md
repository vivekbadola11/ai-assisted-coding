# SHOP-109 · Checkout sometimes fails with a 500

| Field | Value |
|---|---|
| Type | Bug |
| Priority | High |
| Reporter | On-call (Dev) |
| Status | Open |
| Labels | checkout, incident |

## Description

A handful of customers per day get "Internal server error" when they press
Checkout. Retrying doesn't help them. Most customers are fine.

The last three days of API logs are in `logs/app.log` (about 3,000 lines).
Please find what's going on and who is affected.
