import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Repository root (two levels up from api/src). */
export const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

const envFile = resolve(REPO_ROOT, '.env');
if (existsSync(envFile)) {
  // Values already present in process.env win over the file.
  process.loadEnvFile(envFile);
}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable ${name}. Add it to .env (see .env.example).`);
  }
  return value;
}

export interface Config {
  port: number;
  dbPath: string;
  paymentApiKey: string;
  adminToken: string;
  /** GST rate as a fraction, e.g. 0.18 for 18% */
  taxRate: number;
  /** Orders at or above this subtotal (₹) ship free. See docs/business-rules.md */
  freeShippingThreshold: number;
  /** Flat shipping fee (₹) below the threshold */
  shippingFee: number;
}

export const config: Config = {
  port: Number(process.env.PORT ?? 4000),
  dbPath: resolve(REPO_ROOT, process.env.DB_PATH ?? 'api/data/shoplite.db'),
  paymentApiKey: required('PAYMENT_API_KEY'),
  adminToken: required('ADMIN_TOKEN'),
  taxRate: Number(required('TAX_RATE')),
  freeShippingThreshold: 999,
  shippingFee: 49,
};
