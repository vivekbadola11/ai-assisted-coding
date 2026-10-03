import type { Deps } from '../app.ts';
import { HttpError, type ApiRequest, type Router } from '../http/router.ts';
import { positiveInt } from '../http/validate.ts';

interface CustomerRow {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  marketing_opt_in: number;
  created_at: string;
}

function requireAdmin(req: ApiRequest, adminToken: string): void {
  if (req.headers['x-admin-token'] !== adminToken) {
    throw new HttpError(401, 'Admin token required');
  }
}

function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function registerAdminRoutes(router: Router<Deps>): void {
  /** GET /api/admin/customers/export.csv — used by the marketing team */
  router.get('/api/admin/customers/export.csv', (req, { db, config }) => {
    requireAdmin(req, config.adminToken);
    const rows = db.prepare('SELECT * FROM customers ORDER BY id').all() as unknown as CustomerRow[];
    const header = ['id', 'full_name', 'email', 'phone', 'address', 'marketing_opt_in', 'created_at'];
    const lines = rows.map((row) => header.map((key) => csvCell(row[key as keyof CustomerRow])).join(','));
    return {
      status: 200,
      headers: { 'content-type': 'text/csv; charset=utf-8' },
      body: [header.join(','), ...lines].join('\n'),
    };
  });

  router.get('/api/admin/customers/:id', (req, { db, config }) => {
    requireAdmin(req, config.adminToken);
    const id = positiveInt(req.params.id, 'id');
    const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as CustomerRow | undefined;
    if (!row) throw new HttpError(404, `Customer ${id} not found`);
    return { status: 200, body: row };
  });
}
