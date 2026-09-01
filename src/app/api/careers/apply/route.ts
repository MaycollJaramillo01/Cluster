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

  if (asText(form.get('company'))) {
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
  const portfolioUrl = asText(form.get('portfolioUrl'));
  const linkedin = asText(form.get('linkedin'));

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
  for (const file of portfolioFiles) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 400 });
    }
    if (!isAllowed(file.type, ALLOWED_PORTFOLIO_TYPES)) {
      return NextResponse.json({ ok: false, error: 'invalid_file_type' }, { status: 400 });
    }
    total += file.size;
  }

  if (cv) {
    if (cv.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 400 });
    }
    if (!isAllowed(cv.type, ALLOWED_CV_TYPES)) {
      return NextResponse.json({ ok: false, error: 'invalid_file_type' }, { status: 400 });
    }
  }

  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 400 });
  }

  const id = randomUUID();
  const files: ApplicationAsset[] = [];

  try {
    for (const file of portfolioFiles) {
      const fileId = randomUUID();
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await saveApplicationAsset({
        applicationId: id,
        fileId,
        originalName: file.name,
        mimeType: file.type,
        buffer,
      });
      files.push({
        id: fileId,
        field: 'portfolio',
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
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
        mimeType: cv.type,
        buffer,
      });
      files.push({
        id: fileId,
        field: 'cv',
        originalName: cv.name,
        mimeType: cv.type,
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
