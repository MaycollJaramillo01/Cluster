import { NextResponse } from 'next/server';
import { getApplication, readAssetBuffer } from '@/lib/careers/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ applicationId: string; fileId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { applicationId, fileId } = await context.params;
  const application = await getApplication(applicationId);
  if (!application) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const result = await readAssetBuffer(application, fileId);
  if (!result) {
    return NextResponse.json({ ok: false, error: 'file_not_found' }, { status: 404 });
  }

  const bytes = new Uint8Array(result.buffer);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': result.asset.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(result.asset.originalName)}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
