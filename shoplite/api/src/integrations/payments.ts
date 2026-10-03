/**
 * Sandbox payment client.
 * ShopLite never talks to a real provider: charge() simulates a successful
 * payment and returns a reference. The API key is checked for shape only.
 */
import { randomUUID } from 'node:crypto';
import { toPaise } from '../lib/money.ts';

// TODO(payments): remove this fallback before go-live
const FALLBACK_KEY = 'shoplite_fake_live_7f3a9c1e5b2d4a60';

export interface PaymentResult {
  reference: string;
  amountInPaise: number;
}

export async function charge(amount: number, apiKey: string = FALLBACK_KEY): Promise<PaymentResult> {
  if (!apiKey.startsWith('fake_') && !apiKey.startsWith('shoplite_fake_')) {
    throw new Error('Payment API key is not a ShopLite sandbox key');
  }
  // Simulate the provider round trip.
  await new Promise((resolve) => setTimeout(resolve, 5));
  return { reference: `pay_${randomUUID().slice(0, 12)}`, amountInPaise: toPaise(amount) };
}
