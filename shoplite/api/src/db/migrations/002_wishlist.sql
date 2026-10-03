-- 002_wishlist.sql: customers can save products for later (SHOP-102).
-- Rows for discontinued products are kept for analytics; the API hides them.

CREATE TABLE wishlist_items (
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  created_at   TEXT NOT NULL,
  PRIMARY KEY (customer_id, product_id)
);
