/**
 * Money helpers. ShopLite stores rupees as REAL in SQLite, so every
 * amount that leaves the pricing code must be rounded to paise (2 dp).
 */

/** Round a rupee amount to 2 decimal places (paise), half away from zero. */
export function roundMoney(amount: number): number {
  const sign = amount < 0 ? -1 : 1;
  return (sign * Math.round((Math.abs(amount) + Number.EPSILON) * 100)) / 100;
}

/** Convert rupees to integer paise for payment providers. */
export function toPaise(amount: number): number {
  return Math.round(roundMoney(amount) * 100);
}

/** Format a rupee amount for display, e.g. 1234.5 -> "₹1,234.50". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}
