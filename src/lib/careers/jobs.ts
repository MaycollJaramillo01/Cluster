import { promises as fs } from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';
import { DEFAULT_JOB_SLUG, isJobSlug, type JobOpening } from './types';

const JOBS_BLOB = 'careers/jobs.json';
const JOBS_FS = path.join(process.cwd(), 'data', 'careers', 'jobs.json');
const JOBS_TMP = path.join('/tmp', 'cluster-careers-jobs.json');

export const DEFAULT_JOB: JobOpening = {
  slug: DEFAULT_JOB_SLUG,
  title: 'Editor de video',
  summary: 'Edita contenido corto para redes sociales y forma parte de un equipo en crecimiento.',
  description: '',
  location: 'Remoto',
  employment: 'Tiempo completo',
  open: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  ).trim();
}

function blobAuth() {
  const token = blobToken();
  return token ? { token } : {};
}

function hydrateJob(raw: Partial<JobOpening> | null | undefined): JobOpening | null {
  if (!raw || typeof raw !== 'object') return null;
  const slug = String(raw.slug ?? '').trim();
  const title = String(raw.title ?? '').trim();
  if (!isJobSlug(slug) || title.length < 2) return null;
  return {
    slug,
    title: title.slice(0, 80),
    summary: String(raw.summary ?? '').trim().slice(0, 400),
    description: String(raw.description ?? '').trim().slice(0, 4000),
    location: String(raw.location ?? '').trim().slice(0, 80) || 'Remoto',
    employment: String(raw.employment ?? '').trim().slice(0, 80) || 'Tiempo completo',
    open: raw.open !== false,
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
  };
}

export function slugifyJob(title: string) {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return isJobSlug(base) ? base : 'puesto';
}

async function readJobsFile(): Promise<JobOpening[]> {
  const parse = (data: unknown) => {
    const list = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { jobs?: unknown }).jobs)
        ? (data as { jobs: unknown[] }).jobs
        : [];
    return list.map((item) => hydrateJob(item as Partial<JobOpening>)).filter(Boolean) as JobOpening[];
  };

  const token = blobToken();
  if (token) {
    try {
      const { blobs } = await list({ token, prefix: JOBS_BLOB, limit: 5 });
      const match = blobs.find((item) => item.pathname === JOBS_BLOB);
      if (match) {
        const res = await fetch(match.url, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) return mergeDefaults(parse(await res.json()));
      }
    } catch (error) {
      console.warn('[careers] jobs blob read skipped:', error);
    }
  }

  for (const file of [JOBS_FS, JOBS_TMP]) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      return mergeDefaults(parse(JSON.parse(raw)));
    } catch {
      /* missing */
    }
  }
  return mergeDefaults([]);
}

function mergeDefaults(jobs: JobOpening[]) {
  if (jobs.some((item) => item.slug === DEFAULT_JOB_SLUG)) return jobs;
  return [DEFAULT_JOB, ...jobs];
}

async function writeJobsFile(jobs: JobOpening[]) {
  const json = JSON.stringify({ jobs }, null, 2);
  const dest = process.env.VERCEL ? JOBS_TMP : JOBS_FS;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, json);

  if (blobToken()) {
    try {
      await put(JOBS_BLOB, json, {
        ...blobAuth(),
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
    } catch (error) {
      console.warn('[careers] jobs blob write skipped:', error);
    }
  }
}

export async function listJobs() {
  const jobs = await readJobsFile();
  return [...jobs].sort((a, b) => {
    if (a.open !== b.open) return a.open ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getJob(slug: string) {
  const normalized = String(slug ?? '').trim();
  const jobs = await readJobsFile();
  return jobs.find((item) => item.slug === normalized) ?? null;
}

export async function createJob(input: {
  title: string;
  summary: string;
  description?: string;
  location?: string;
  employment?: string;
}) {
  const title = String(input.title ?? '').trim();
  const summary = String(input.summary ?? '').trim();
  if (title.length < 2) return { ok: false as const, error: 'title_required' };
  if (summary.length < 8) return { ok: false as const, error: 'summary_required' };

  const jobs = await readJobsFile();
  let slug = slugifyJob(title);
  let n = 2;
  while (jobs.some((item) => item.slug === slug)) {
    slug = `${slugifyJob(title).slice(0, 56)}-${n}`;
    n += 1;
  }

  const now = new Date().toISOString();
  const job = hydrateJob({
    slug,
    title,
    summary,
    description: input.description,
    location: input.location,
    employment: input.employment,
    open: true,
    createdAt: now,
    updatedAt: now,
  });
  if (!job) return { ok: false as const, error: 'invalid_job' };

  jobs.push(job);
  await writeJobsFile(jobs);
  return { ok: true as const, job };
}

export async function updateJob(
  slug: string,
  patch: Partial<Pick<JobOpening, 'title' | 'summary' | 'description' | 'location' | 'employment' | 'open'>>,
) {
  const jobs = await readJobsFile();
  const current = jobs.find((item) => item.slug === slug);
  if (!current) return { ok: false as const, error: 'not_found' };

  const next = hydrateJob({
    ...current,
    title: patch.title ?? current.title,
    summary: patch.summary ?? current.summary,
    description: patch.description ?? current.description,
    location: patch.location ?? current.location,
    employment: patch.employment ?? current.employment,
    open: patch.open ?? current.open,
    slug: current.slug,
    updatedAt: new Date().toISOString(),
  });
  if (!next) return { ok: false as const, error: 'invalid_job' };

  await writeJobsFile(jobs.map((item) => (item.slug === slug ? next : item)));
  return { ok: true as const, job: next };
}
