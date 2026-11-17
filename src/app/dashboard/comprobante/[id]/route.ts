import { NextResponse } from 'next/server';
import { canDo } from '@/lib/crm/roles';
import { dashboardSession } from '@/lib/crm/session';
import { getTransferById, readReceipt } from '@/lib/valux/transfers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Comprobantes privados: solo finanzas y superadmin.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await dashboardSession();
  if (!session || !canDo(session.role, 'finanzas')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const transfer = await getTransferById(id);
  if (!transfer?.receipt_url) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const file = await readReceipt(transfer.receipt_url);
  if (!file) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(file.body, {
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${transfer.reference}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
