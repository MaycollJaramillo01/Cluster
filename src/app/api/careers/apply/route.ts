import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  ALLOWED_CV_TYPES,
  ALLOWED_PORTFOLIO_TYPES,
  MAX_FILE_BYTES,
  MAX_PORTFOLIO_FILES,
  MAX_TOTAL_BYTES,
  type Application,
  type ApplicationAsset,
  type CareersJobSlug,
  isCareersJobSlug,
} from '@/lib/careers/types';
import { saveApplicationAsset, saveApplicationJson } from '@/lib/careers/store';
import { notifyApplication } from '@/lib/careers/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

function asText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

function mimeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || '';
}

function resolvedType(file: File, allowed: readonly string[]) {
  if (isAllowed(file.type, allowed)) return file.type;
  const inferred = mimeFromName(file.name);
  return isAllowed(inferred, allowed) ? inferred : '';
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isAllowed(type: string, allowed: readonly string[]) {
  return allowed.includes(type);
}

async function fileFrom(entry: FormDataEntryValue | null) {
  if (!entry || typeof entry === 'string') return null;
  if (!(entry instanceof File) || entry.size === 0) return null;
  return entry;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_form' }, { status: 400 });
  }

  if (asText(form.get('_gotcha'))) {
    return NextResponse.json({ ok: true });
  }

  const jobSlugRaw = asText(form.get('jobSlug')) || 'editor-de-video';
  if (!isCareersJobSlug(jobSlugRaw)) {
    return NextResponse.json({ ok: false, error: 'invalid_job' }, { status: 400 });
  }
  const jobSlug: CareersJobSlug = jobSlugRaw;

  const name = asText(form.get('name'));
  const email = asText(form.get('email'));
  const whatsapp = asText(form.get('whatsapp'));
  const country = asText(form.get('country'));
  const salaryUsd = asText(form.get('salaryUsd'));
  const portfolioUrl = normalizeUrl(asText(form.get('portfolioUrl')));
  const linkedin = normalizeUrl(asText(form.get('linkedin')));

  if (!name || !email || !whatsapp || !country || !salaryUsd) {
    return NextResponse.json(
      { ok: false, error: 'missing_required_fields' },
      { status: 400 },
    );
  }

  const portfolioEntries = form.getAll('portfolio');
  const portfolioFiles: File[] = [];
  for (const entry of portfolioEntries) {
    const file = await fileFrom(entry);
    if (file) portfolioFiles.push(file);
  }

  if (portfolioFiles.length > MAX_PORTFOLIO_FILES) {
    return NextResponse.json({ ok: false, error: 'too_many_files' }, { status: 400 });
  }

  const cv = await fileFrom(form.get('cv'));
  if (!portfolioFiles.length && !portfolioUrl) {
    return NextResponse.json(
      { ok: false, error: 'portfolio_required' },
      { status: 400 },
    );
  }

  let total = cv?.size ?? 0;
  const portfolioMeta: { file: File; mimeType: string }[] = [];
  for (const file of portfolioFiles) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 400 });
    }
    const mimeType = resolvedType(file, ALLOWED_PORTFOLIO_TYPES);
    if (!mimeType) {
      return NextResponse.json({ ok: false, error: 'invalid_file_type' }, { status: 400 });
    }
    total += file.size;
    portfolioMeta.push({ file, mimeType });
  }

  let cvMime = '';
  if (cv) {
    if (cv.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 400 });
    }
    cvMime = resolvedType(cv, ALLOWED_CV_TYPES);
    if (!cvMime) {
      return NextResponse.json({ ok: false, error: 'invalid_file_type' }, { status: 400 });
    }
  }

  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 400 });
  }

  const id = randomUUID();
  const files: ApplicationAsset[] = [];

  try {
    for (const item of portfolioMeta) {
      const fileId = randomUUID();
      const buffer = Buffer.from(await item.file.arrayBuffer());
      const stored = await saveApplicationAsset({
        applicationId: id,
        fileId,
        originalName: item.file.name,
        mimeType: item.mimeType,
        buffer,
      });
      files.push({
        id: fileId,
        field: 'portfolio',
        originalName: item.file.name,
        mimeType: item.mimeType,
        size: item.file.size,
        pathname: stored.pathname,
        url: stored.url,
      });
    }

    if (cv) {
      const fileId = randomUUID();
      const buffer = Buffer.from(await cv.arrayBuffer());
      const stored = await saveApplicationAsset({
        applicationId: id,
        fileId,
        originalName: cv.name,
        mimeType: cvMime,
        buffer,
      });
      files.push({
        id: fileId,
        field: 'cv',
        originalName: cv.name,
        mimeType: cvMime,
        size: cv.size,
        pathname: stored.pathname,
        url: stored.url,
      });
    }

    const application: Application = {
      id,
      jobSlug,
      createdAt: new Date().toISOString(),
      name,
      email,
      whatsapp,
      country,
      salaryUsd,
      portfolioUrl,
      linkedin,
      files,
      status: 'new',
    };

    await saveApplicationJson(application);
    await notifyApplication(application);

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('[careers] apply error:', error);
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 });
  }
}
