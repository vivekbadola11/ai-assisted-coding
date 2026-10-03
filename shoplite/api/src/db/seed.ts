/**
 * Seed data for local development.
 *
 * ALL PEOPLE IN THIS FILE ARE SYNTHETIC. Names are generated, emails use
 * example.com, phone numbers and PIN codes start with 0 (not valid in India),
 * and cities are invented. Treat it like real customer data anyway: it is
 * here so the security labs have personal data to protect.
 */
import { roundMoney } from '../lib/money.ts';
import { transaction, type DB } from './connection.ts';

/** Small deterministic PRNG so every machine gets identical seed data. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = [
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'home', name: 'Home' },
  { slug: 'kitchen', name: 'Kitchen' },
  { slug: 'fitness', name: 'Fitness' },
  { slug: 'stationery', name: 'Stationery' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

interface SeedProduct {
  name: string;
  category: CategorySlug;
  price: number;
  stock?: number;
  active?: boolean;
}

// Inserted in this order, so ids are stable: id 1 is the Cotton Crew T-Shirt.
export const SEED_PRODUCTS: SeedProduct[] = [
  { name: 'Cotton Crew T-Shirt', category: 'apparel', price: 499, stock: 120 },
  { name: 'Linen Shirt', category: 'apparel', price: 1299 },
  { name: 'Slim Fit Denim Jeans', category: 'apparel', price: 1799 },
  { name: 'Classic Denim Jacket', category: 'apparel', price: 1999, stock: 4, active: false },
  { name: 'Hooded Sweatshirt', category: 'apparel', price: 1499 },
  { name: 'Chino Shorts', category: 'apparel', price: 899 },
  { name: 'Cotton Kurta', category: 'apparel', price: 1099 },
  { name: 'Wool Blend Socks (3 pack)', category: 'apparel', price: 349 },
  { name: 'Rain Jacket', category: 'apparel', price: 2499, stock: 0 },
  { name: 'Polo T-Shirt', category: 'apparel', price: 699 },
  { name: 'Track Pants', category: 'apparel', price: 999 },
  { name: 'Canvas Cap', category: 'apparel', price: 399 },
  { name: 'Cotton Bedsheet Set', category: 'home', price: 1299 },
  { name: 'Blackout Curtains', category: 'home', price: 1599 },
  { name: 'Cushion Cover Pair', category: 'home', price: 449 },
  { name: 'Bamboo Bath Towel', category: 'home', price: 599 },
  { name: 'Table Lamp', category: 'home', price: 1199 },
  { name: 'Wall Clock', category: 'home', price: 799 },
  { name: 'Storage Basket', category: 'home', price: 549 },
  { name: 'Coir Door Mat', category: 'home', price: 299 },
  { name: 'Scented Candle', category: 'home', price: 349 },
  { name: 'Photo Frame Set', category: 'home', price: 649 },
  { name: 'Throw Blanket', category: 'home', price: 1399 },
  { name: 'Laundry Hamper', category: 'home', price: 699 },
  { name: 'Steel Water Bottle 1L', category: 'kitchen', price: 349, stock: 3 },
  { name: 'Ceramic Coffee Mug', category: 'kitchen', price: 249.5 },
  { name: 'Non-stick Frying Pan', category: 'kitchen', price: 1149 },
  { name: 'Pressure Cooker 3L', category: 'kitchen', price: 1899 },
  { name: 'Glass Storage Jars (set of 4)', category: 'kitchen', price: 799 },
  { name: "Chef's Knife", category: 'kitchen', price: 899 },
  { name: 'Bamboo Cutting Board', category: 'kitchen', price: 449 },
  { name: 'Electric Kettle', category: 'kitchen', price: 1299 },
  { name: 'Spice Rack', category: 'kitchen', price: 599 },
  { name: 'Lunch Box Set', category: 'kitchen', price: 649 },
  { name: 'Cast Iron Tawa', category: 'kitchen', price: 999 },
  { name: 'Measuring Cups', category: 'kitchen', price: 299 },
  { name: 'Yoga Mat Pro', category: 'fitness', price: 1299 },
  { name: 'Resistance Bands Set', category: 'fitness', price: 699 },
  { name: 'Dumbbell Pair 5kg', category: 'fitness', price: 1599 },
  { name: 'Skipping Rope', category: 'fitness', price: 249 },
  { name: 'Foam Roller', category: 'fitness', price: 799 },
  { name: 'Gym Bag', category: 'fitness', price: 1099 },
  { name: 'Shaker Bottle', category: 'fitness', price: 299 },
  { name: 'Running Socks', category: 'fitness', price: 349 },
  { name: 'Ab Roller', category: 'fitness', price: 549 },
  { name: 'Kettlebell 8kg', category: 'fitness', price: 1499, stock: 0 },
  { name: 'Fitness Tracker Band', category: 'fitness', price: 2499 },
  { name: 'Sweatband Set', category: 'fitness', price: 199 },
  { name: 'A5 Notebook (pack of 3)', category: 'stationery', price: 299 },
  { name: 'Gel Pens (10 pack)', category: 'stationery', price: 199 },
  { name: 'Desk Organizer', category: 'stationery', price: 649 },
  { name: 'Sticky Notes Cube', category: 'stationery', price: 149.5 },
  { name: 'Fountain Pen', category: 'stationery', price: 899 },
  { name: 'Sketchbook A4', category: 'stationery', price: 349 },
  { name: 'Highlighters (6 pack)', category: 'stationery', price: 179 },
  { name: 'Planner 2027', category: 'stationery', price: 499 },
  { name: 'Pencil Set', category: 'stationery', price: 129 },
  { name: 'Document Folder', category: 'stationery', price: 249 },
  { name: 'Desk Calendar', category: 'stationery', price: 299 },
  { name: 'Whiteboard Markers', category: 'stationery', price: 199 },
  { name: 'Reusable Shopping Bag', category: 'home', price: 199 },
];

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Isha', 'Kabir', 'Meera', 'Rohan', 'Saanvi',
  'Aditya', 'Kavya', 'Ishaan', 'Priya', 'Reyansh', 'Tara', 'Vivaan', 'Nisha', 'Dev', 'Riya',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Nair', 'Reddy', 'Gupta', 'Mehta', 'Kapoor', 'Joshi', 'Menon',
  'Rao', 'Patel', 'Das', 'Bose', 'Kulkarni', 'Pillai', 'Chopra', 'Bhat', 'Saxena', 'Malhotra',
];
const FAKE_CITIES = ['Testpur', 'Sampleabad', 'Demonagar', 'Mockpuram', 'Fixtureganj'];

const COUPONS = [
  { code: 'SAVE10', type: 'percent', value: 10, minSubtotal: 0, active: 1 },
  { code: 'FLAT100', type: 'flat', value: 100, minSubtotal: 500, active: 1 },
  { code: 'FESTIVE15', type: 'percent', value: 15, minSubtotal: 1500, active: 1 },
  { code: 'WELCOME50', type: 'percent', value: 50, minSubtotal: 0, active: 0 },
] as const;

/** Historical orders were priced with these rules; see docs/business-rules.md. */
const HISTORICAL_TAX_RATE = 0.18;

function isoDaysAfter(start: string, days: number, minutes = 0): string {
  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

export function seed(db: DB): void {
  const random = mulberry32(20261003);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  transaction(db, () => {
    const insertCategory = db.prepare('INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)');
    CATEGORIES.forEach((category, index) => insertCategory.run(index + 1, category.slug, category.name));
    const categoryId = (slug: CategorySlug) => CATEGORIES.findIndex((c) => c.slug === slug) + 1;

    const insertProduct = db.prepare(`INSERT INTO products
      (id, sku, name, description, category_id, price, stock, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    SEED_PRODUCTS.forEach((product, index) => {
      const id = index + 1;
      // One product per day, oldest first. Products 30-35 arrived in a single
      // bulk import, so they share a timestamp.
      const createdAt = id >= 30 && id <= 35
        ? isoDaysAfter('2025-10-01T09:00:00.000Z', 30)
        : isoDaysAfter('2025-10-01T09:00:00.000Z', id);
      insertProduct.run(
        id,
        `SL-${product.category.slice(0, 3).toUpperCase()}-${String(id).padStart(3, '0')}`,
        product.name,
        `${product.name} from the ShopLite ${product.category} range.`,
        categoryId(product.category),
        product.price,
        product.stock ?? int(8, 80),
        product.active === false ? 0 : 1,
        createdAt,
      );
    });

    const insertCoupon = db.prepare('INSERT INTO coupons (code, type, value, min_subtotal, active) VALUES (?, ?, ?, ?, ?)');
    for (const c of COUPONS) insertCoupon.run(c.code, c.type, c.value, c.minSubtotal, c.active);

    const insertCustomer = db.prepare(`INSERT INTO customers
      (id, full_name, email, phone, address, marketing_opt_in, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (let id = 1; id <= 200; id++) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      insertCustomer.run(
        id,
        `${first} ${last}`,
        `${first}.${last}${id}@example.com`.toLowerCase(),
        `+91 00000 ${String(10000 + id).slice(-5)}`,
        `Flat ${int(1, 40)}, Example Residency, Sector ${int(1, 60)}, ${pick(FAKE_CITIES)} 000${String(int(100, 999))}`,
        random() < 0.4 ? 1 : 0,
        isoDaysAfter('2025-06-01T08:00:00.000Z', int(0, 300)),
      );
    }

    const activeProducts = SEED_PRODUCTS
      .map((p, index) => ({ ...p, id: index + 1 }))
      .filter((p) => p.active !== false);
    const insertOrder = db.prepare(`INSERT INTO orders
      (id, customer_id, cart_id, coupon_code, subtotal, discount, tax, shipping, total, payment_reference, status, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`);
    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');

    for (let orderId = 1; orderId <= 300; orderId++) {
      const lines = new Map<number, { price: number; quantity: number }>();
      const lineCount = int(1, 4);
      while (lines.size < lineCount) {
        const product = pick(activeProducts);
        lines.set(product.id, { price: product.price, quantity: int(1, 3) });
      }
      const subtotal = [...lines.values()].reduce((sum, l) => sum + l.price * l.quantity, 0);
      const coupon = random() < 0.2 ? COUPONS[0] : null;
      const discount = coupon ? roundMoney((subtotal * coupon.value) / 100) : 0;
      const tax = roundMoney((subtotal - discount) * HISTORICAL_TAX_RATE);
      const shipping = subtotal >= 999 ? 0 : 49;
      // Customer 12 is a loyal regular with a long order history.
      const customerId = orderId % 7 === 0 ? 12 : int(1, 200);
      insertOrder.run(
        orderId,
        customerId,
        coupon?.code ?? null,
        roundMoney(subtotal),
        discount,
        tax,
        shipping,
        roundMoney(subtotal - discount + tax + shipping),
        `pay_seed_${String(orderId).padStart(5, '0')}`,
        isoDaysAfter('2026-01-01T10:00:00.000Z', int(0, 250), int(0, 600)),
      );
      for (const [productId, line] of lines) insertOrderItem.run(orderId, productId, line.quantity, line.price);
    }

    // A few open carts. Cart 3 still holds the discontinued Classic Denim Jacket (id 4).
    const insertCart = db.prepare("INSERT INTO carts (id, customer_id, coupon_code, status, created_at) VALUES (?, ?, ?, 'open', ?)");
    const insertCartItem = db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)');
    insertCart.run(1, 12, null, '2026-09-28T10:15:00.000Z');
    insertCartItem.run(1, 1, 2);
    insertCart.run(2, 45, 'SAVE10', '2026-09-29T18:40:00.000Z');
    insertCartItem.run(2, 1, 2);
    insertCart.run(3, 7, null, '2026-09-30T07:05:00.000Z');
    insertCartItem.run(3, 4, 1);
    insertCartItem.run(3, 1, 1);
    insertCart.run(4, 88, null, '2026-10-01T12:30:00.000Z');
    insertCartItem.run(4, 25, 2);
  });
}
