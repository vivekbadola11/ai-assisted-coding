# ShopLite API

Base URL in development: `http://localhost:4000`. All bodies are JSON.
Errors look like `{ "error": "message" }`.

## Products

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products?page=1&pageSize=20&q=&category=` | Active products, newest first. `pageSize` max 100 |
| GET | `/api/products/:id` | 404 for unknown or discontinued products |

## Carts

| Method | Path | Body |
|---|---|---|
| POST | `/api/carts` | `{ "customerId"?: number }` |
| GET | `/api/carts/:id` | Cart with lines and `totals` |
| POST | `/api/carts/:id/items` | `{ "productId": number, "quantity"?: number }` (adds to existing quantity) |
| PATCH | `/api/carts/:id/items/:productId` | `{ "quantity": number }` |
| DELETE | `/api/carts/:id/items/:productId` | |
| POST | `/api/carts/:id/coupon` | `{ "code": string }` |
| DELETE | `/api/carts/:id/coupon` | |

## Orders

| Method | Path | Notes |
|---|---|---|
| POST | `/api/orders` | `{ "cartId": number }`: checkout |
| GET | `/api/orders?customerId=12` | Order history with items |
| GET | `/api/orders/:id` | One order with items |

## Admin (header `x-admin-token: $ADMIN_TOKEN`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/customers/export.csv` | All customers as CSV |
| GET | `/api/admin/customers/:id` | One customer record |
