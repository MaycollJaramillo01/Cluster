import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import {
  ALLOWED_CV_TYPES,
  ALLOWED_PORTFOLIO_TYPES,
  CAREERS_UPLOAD_PREFIX,
  MAX_FILE_BYTES,
} from '@/lib/careers/types';

export const runtime = 'nodejs';

function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  ).trim();
}

export async function POST(request: Request) {
  const token = blobToken();
  // Sin Blob el formulario manda los archivos por FormData, como antes.
  if (!token) return NextResponse.json({ error: 'blob_not_configured' }, { status: 503 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      token,
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(CAREERS_UPLOAD_PREFIX)) throw new Error('invalid_path');
        return {
          allowedContentTypes: [...new Set([...ALLOWED_PORTFOLIO_TYPES, ...ALLOWED_CV_TYPES])],
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[careers] upload token error:', error);
    return NextResponse.json({ error: 'upload_failed' }, { status: 400 });
  }
}
