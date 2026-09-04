import { promises as fs } from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';
import type { Application, ApplicationPatchInput } from './types';
import { applyApplicationPatch, normalizeApplication } from './crm';

const FS_DIR = path.join(process.cwd(), 'data', 'careers');
const TMP_DIR = path.join('/tmp', 'cluster-careers');

function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  ).trim();
}

function blobEnabled() {
  return Boolean(
    blobToken() ||
      ((process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN_STORE_ID) &&
        process.env.VERCEL_OIDC_TOKEN),
  );
}

function blobAuth() {
  const token = blobToken();
  return token ? { token } : {};
}

const blobPutBase = {
  access: 'private' as const,
  addRandomSuffix: false,
  allowOverwrite: true,
};

function blobError(error: unknown) {
  const cause = error && typeof error === 'object' ? (error as { cause?: { code?: string } }).cause : undefined;
  const code = cause?.code || (error instanceof Error ? error.message : 'blob_failed');
  console.warn('[careers] blob unavailable, using local files:', code);
}

async function readBlobJson<T>(url: string): Promise<T | null> {
  try {
    const headers: HeadersInit = {};
    const token = blobToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { cache: 'no-store', headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    blobError(error);
    return null;
  }
}

async function readBlobBuffer(url: string) {
  try {
    const headers: HeadersInit = {};
    const token = blobToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (error) {
    blobError(error);
    return null;
  }
}

async function tryBlobPut(...args: Parameters<typeof put>) {
  try {
    return await put(...args);
  } catch (error) {
    blobError(error);
    return null;
  }
}

async function tryBlobList(prefix: string, limit = 1000) {
  try {
    return await list({ ...blobAuth(), prefix, limit });
  } catch (error) {
    blobError(error);
    return null;
  }
}

function dataDir() {
  return process.env.VERCEL ? TMP_DIR : FS_DIR;
}

function profileBlobPath(id: string) {
  return `careers/applications/${id}.json`;
}

function fileBlobPath(applicationId: string, fileId: string, safeName: string) {
  return `careers/files/${applicationId}/${fileId}-${safeName}`;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFsFile(relPath: string, body: Buffer | string) {
  const abs = path.join(dataDir(), relPath);
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, body);
  return abs;
}

async function readFsFile(relPath: string) {
  const abs = path.join(dataDir(), relPath);
  return fs.readFile(abs);
}

async function readFsJson<T>(relPath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(dataDir(), relPath), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeFileName(name: string) {
  const base = name.normalize('NFKD').replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-');
  return base.slice(0, 80) || 'archivo';
}

export async function saveApplicationJson(application: Application) {
  const json = JSON.stringify(application, null, 2);
  await writeFsFile(`applications/${application.id}.json`, json);

  if (blobEnabled()) {
    await tryBlobPut(profileBlobPath(application.id), json, {
      ...blobAuth(),
      ...blobPutBase,
      contentType: 'application/json',
    });
  }
}

export async function saveApplicationAsset(opts: {
  applicationId: string;
  fileId: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const safe = safeFileName(opts.originalName);
  const rel = `files/${opts.applicationId}/${opts.fileId}-${safe}`;
  await writeFsFile(rel, opts.buffer);

  let url: string | undefined;
  if (blobEnabled()) {
    const blob = await tryBlobPut(fileBlobPath(opts.applicationId, opts.fileId, safe), opts.buffer, {
      ...blobAuth(),
      ...blobPutBase,
      contentType: opts.mimeType || 'application/octet-stream',
    });
    url = blob?.url;
  }

  return { pathname: rel, url };
}

export async function getApplication(id: string): Promise<Application | null> {
  if (blobEnabled()) {
    const listed = await tryBlobList(profileBlobPath(id), 10);
    const match = listed?.blobs.find((item) => item.pathname === profileBlobPath(id));
    if (match) {
      const res = await readBlobJson<Application>(match.url);
      const normalized = normalizeApplication(res);
      if (normalized) return normalized;
    }
  }
  return normalizeApplication(await readFsJson<Application>(`applications/${id}.json`));
}

async function listApplicationsFromFs(): Promise<Application[]> {
  try {
    const dir = path.join(dataDir(), 'applications');
    const names = await fs.readdir(dir);
    const apps = await Promise.all(
      names
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => readFsJson<Application>(`applications/${name}`)),
    );
    return sortApplications(
      apps
        .map((item) => normalizeApplication(item))
        .filter((item): item is Application => Boolean(item)),
    );
  } catch {
    return [];
  }
}

export async function listApplications(): Promise<Application[]> {
  if (blobEnabled()) {
    const listed = await tryBlobList('careers/applications/', 1000);
    if (listed) {
      const apps = await Promise.all(
        listed.blobs
          .filter((item) => item.pathname.endsWith('.json'))
          .map(async (item) => readBlobJson<Application>(item.url)),
      );
      const fromBlob = sortApplications(
        apps
          .map((item) => normalizeApplication(item))
          .filter((item): item is Application => Boolean(item)),
      );
      if (fromBlob.length > 0) return fromBlob;
    }
  }

  return listApplicationsFromFs();
}

function sortApplications(apps: Application[]) {
  return apps.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type BlobHealth = {
  configured: boolean;
  ok: boolean;
  error?: string;
};

export async function pingBlob(): Promise<BlobHealth> {
  if (!blobEnabled()) {
    return { configured: false, ok: false, error: 'not_configured' };
  }

  try {
    const listed = await tryBlobList('careers/', 1);
    if (!listed) {
      return { configured: true, ok: false, error: 'unreachable' };
    }
    return { configured: true, ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'blob_failed';
    console.error('[careers] blob ping failed:', message);
    return { configured: true, ok: false, error: message };
  }
}

export async function probeBlobWrite(): Promise<BlobHealth> {
  if (!blobEnabled()) {
    return { configured: false, ok: false, error: 'not_configured' };
  }

  try {
    const pathname = 'careers/_health.json';
    await put(
      pathname,
      JSON.stringify({ ok: true, at: new Date().toISOString() }),
      {
        ...blobAuth(),
        ...blobPutBase,
        contentType: 'application/json',
      },
    );
    const { blobs } = await list({ ...blobAuth(), prefix: pathname, limit: 5 });
    const found = blobs.some((item) => item.pathname === pathname);
    if (!found) {
      return { configured: true, ok: false, error: 'list_miss' };
    }
    return { configured: true, ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'blob_failed';
    console.error('[careers] blob write probe failed:', message);
    return { configured: true, ok: false, error: message };
  }
}

export async function updateApplication(id: string, patch: ApplicationPatchInput) {
  const current = await getApplication(id);
  if (!current) return null;
  const next = applyApplicationPatch(current, patch);
  await saveApplicationJson(next);
  return next;
}

export async function updateApplications(ids: string[], patch: ApplicationPatchInput) {
  const unique = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))].slice(0, 80);
  const saved: Application[] = [];
  for (const id of unique) {
    const next = await updateApplication(id, patch);
    if (next) saved.push(next);
  }
  return saved;
}

export async function readAssetBuffer(application: Application, fileId: string) {
  const asset = application.files.find((file) => file.id === fileId);
  if (!asset) return null;

  try {
    const buffer = await readFsFile(asset.pathname);
    return { buffer, asset };
  } catch {
    if (asset.url) {
      const buffer = await readBlobBuffer(asset.url);
      if (buffer) return { buffer, asset };
    }
    return null;
  }
}
