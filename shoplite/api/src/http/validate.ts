import { HttpError } from './router.ts';

export function asObject(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

/** Parse a positive integer from a route param, query value or body field. */
export function positiveInt(value: unknown, name: string): number {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${name} must be a positive integer`);
  }
  return parsed;
}

export function optionalPositiveInt(value: unknown, name: string, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  return positiveInt(value, name);
}

export function nonEmptyString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${name} is required`);
  }
  return value.trim();
}
