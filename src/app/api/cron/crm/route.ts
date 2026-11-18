import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { processDue } from '@/lib/crm/automations';
import { processCampaignSends } from '@/lib/crm/campaigns';
import { expireTransfers } from '@/lib/valux/transfers';
import { nightlyReconcile } from '@/lib/valux/reconcile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Vercel Cron manda "Authorization: Bearer <CRON_SECRET>" cuando la variable existe.
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const given = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const started = Date.now();
  const result: Record<string, unknown> & { automations: number; sent: number; failed: number; expired: number } = { automations: 0, sent: 0, failed: 0, expired: 0 };
  try {
    result.automations = await processDue(200);
    result.expired = await expireTransfers();
    // La conciliación falla sola: no detiene las campañas.
    result.reconcile = await nightlyReconcile().catch((error) => {
      console.error('[cron] conciliación:', error);
      return 'failed';
    });
    // Lotes de campañas hasta acercarse al límite de la función.
    while (Date.now() - started < 240_000) {
      const batch = await processCampaignSends(80);
      result.sent += batch.sent;
      result.failed += batch.failed;
      if (batch.sent + batch.failed === 0) break;
    }
  } catch (error) {
    console.error('[cron] crm:', error);
    return NextResponse.json({ ...result, error: 'failed' }, { status: 500 });
  }
  return NextResponse.json(result);
}
