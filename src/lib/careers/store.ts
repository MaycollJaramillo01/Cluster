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

async function readBlobJson<T>(url: string): Promise<T | null> {
  const headers: HeadersInit = {};
  const token = blobToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function readBlobBuffer(url: string) {
  const headers: HeadersInit = {};
  const token = blobToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
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
    await put(profileBlobPath(application.id), json, {
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
    const blob = await put(fileBlobPath(opts.applicationId, opts.fileId, safe), opts.buffer, {
      ...blobAuth(),
      ...blobPutBase,
      contentType: opts.mimeType || 'application/octet-stream',
    });
    url = blob.url;
  }

  return { pathname: rel, url };
}

export async function getApplication(id: string): Promise<Application | null> {
  if (blobEnabled()) {
    const { blobs } = await list({
      ...blobAuth(),
      prefix: profileBlobPath(id),
      limit: 10,
    });
    const match = blobs.find((item) => item.pathname === profileBlobPath(id));
    if (match) {
      const res = await readBlobJson<Application>(match.url);
      const normalized = normalizeApplication(res);
      if (normalized) return normalized;
    }
  }
  return normalizeApplication(await readFsJson<Application>(`applications/${id}.json`));
}

export async function listApplications(): Promise<Application[]> {
  if (blobEnabled()) {
    const { blobs } = await list({
      ...blobAuth(),
      prefix: 'careers/applications/',
      limit: 1000,
    });
    const apps = await Promise.all(
      blobs
        .filter((item) => item.pathname.endsWith('.json'))
        .map(async (item) => {
          return readBlobJson<Application>(item.url);
        }),
    );
    return sortApplications(
      apps
        .map((item) => normalizeApplication(item))
        .filter((item): item is Application => Boolean(item)),
    );
  }

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
    await list({ ...blobAuth(), prefix: 'careers/', limit: 1 });
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
