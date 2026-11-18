import { crm } from '@/lib/crm/db';

export type Coupon = {
  code: string;
  percent: number;
  amount_cents: number;
  course_id: string | null;
  course_title: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
};

export function cleanCode(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

function iso(value: unknown) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row.code),
    percent: Number(row.percent) || 0,
    amount_cents: Number(row.amount_cents) || 0,
    course_id: row.course_id ? String(row.course_id) : null,
    course_title: String(row.course_title || ''),
    max_uses: row.max_uses == null ? null : Number(row.max_uses),
    uses: Number(row.uses) || 0,
    expires_at: row.expires_at ? iso(row.expires_at) : null,
    active: row.active === true || row.active === 't',
  };
}

export async function listCoupons() {
  const sql = await crm();
  const rows = await sql`
    SELECT k.*, c.title AS course_title FROM valux_coupons k LEFT JOIN lms_courses c ON c.id = k.course_id
    ORDER BY k.created_at DESC
  `;
  return rows.map((row) => mapCoupon(row as Record<string, unknown>));
}

// Precio con cupón, calculado en el servidor. Solo cursos: la membresía es recurrente y el cupón no aplica.
// Devuelve el precio final o el motivo por el que no aplica.
export async function applyCoupon(rawCode: string, courseId: string, priceCents: number, now = new Date()) {
  const code = cleanCode(rawCode);
  if (!code) return { ok: false as const, reason: 'vacio' };
  const sql = await crm();
  const rows = await sql`SELECT * FROM valux_coupons WHERE code = ${code}`;
  const coupon = rows[0] ? mapCoupon(rows[0] as Record<string, unknown>) : null;
  if (!coupon || !coupon.active) return { ok: false as const, reason: 'invalido' };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= now.getTime()) return { ok: false as const, reason: 'vencido' };
  if (coupon.max_uses != null && coupon.uses >= coupon.max_uses) return { ok: false as const, reason: 'agotado' };
  if (coupon.course_id && coupon.course_id !== courseId) return { ok: false as const, reason: 'curso' };
  const off = coupon.percent > 0 ? Math.round((priceCents * Math.min(100, coupon.percent)) / 100) : coupon.amount_cents;
  return { ok: true as const, code, cents: Math.max(0, priceCents - Math.max(0, off)) };
}

// Se cuenta un uso cuando la venta queda entregada (pago confirmado o curso gratis con cupón).
// ponytail: dos pagos simultáneos con el último uso pueden pasar ambos; el tope es orientativo, no contable.
export async function countCouponUse(code: string | null | undefined) {
  const clean = cleanCode(code || '');
  if (!clean) return;
  const sql = await crm();
  await sql`UPDATE valux_coupons SET uses = uses + 1 WHERE code = ${clean}`;
}
