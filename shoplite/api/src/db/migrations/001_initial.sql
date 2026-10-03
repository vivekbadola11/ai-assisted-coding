-- 001_initial.sql: ShopLite base schema.
-- Money columns are rupees stored as REAL; round to paise with lib/money.ts.

CREATE TABLE categories (
  id    INTEGER PRIMARY KEY,
  slug  TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);

CREATE TABLE products (
  id           INTEGER PRIMARY KEY,
  sku          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category_id  INTEGER NOT NULL REFERENCES categories(id),
  price        REAL NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);

CREATE TABLE customers (
  id                INTEGER PRIMARY KEY,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  phone             TEXT NOT NULL,
  address           TEXT NOT NULL,
  marketing_opt_in  INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);

CREATE TABLE coupons (
  code          TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
  value         REAL NOT NULL CHECK (value > 0),
  min_subtotal  REAL NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE carts (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER REFERENCES customers(id),
  coupon_code  TEXT REFERENCES coupons(code),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'checked_out')),
  created_at   TEXT NOT NULL
);

CREATE TABLE cart_items (
  cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE orders (
  id                 INTEGER PRIMARY KEY,
  customer_id        INTEGER REFERENCES customers(id),
  cart_id            INTEGER REFERENCES carts(id),
  coupon_code        TEXT,
  subtotal           REAL NOT NULL,
  discount           REAL NOT NULL,
  tax                REAL NOT NULL,
  shipping           REAL NOT NULL,
  total              REAL NOT NULL,
  payment_reference  TEXT,
  status             TEXT NOT NULL DEFAULT 'paid',
  created_at         TEXT NOT NULL
);

CREATE TABLE order_items (
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  REAL NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
