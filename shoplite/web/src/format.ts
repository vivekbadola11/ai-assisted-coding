const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

/** 1234.5 -> "₹1,234.50" */
export function formatINR(amount: number): string {
  return inr.format(amount);
}
