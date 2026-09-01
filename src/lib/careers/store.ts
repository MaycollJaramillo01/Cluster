import { promises as fs } from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';
import type { Application } from './types';

const FS_DIR = path.join(process.cwd(), 'data', 'careers');
const TMP_DIR = path.join('/tmp', 'cluster-careers');

function blobEnabled() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
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
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
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
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: opts.mimeType || 'application/octet-stream',
    });
    url = blob.url;
  }

  return { pathname: rel, url };
}

export async function getApplication(id: string): Promise<Application | null> {
  if (blobEnabled()) {
    const { blobs } = await list({ prefix: profileBlobPath(id), limit: 10 });
    const match = blobs.find((item) => item.pathname === profileBlobPath(id));
    if (match) {
      const res = await fetch(match.url, { cache: 'no-store' });
      if (res.ok) return (await res.json()) as Application;
    }
  }
  return readFsJson<Application>(`applications/${id}.json`);
}

export async function listApplications(): Promise<Application[]> {
  if (blobEnabled()) {
    const { blobs } = await list({ prefix: 'careers/applications/', limit: 1000 });
    const apps = await Promise.all(
      blobs
        .filter((item) => item.pathname.endsWith('.json'))
        .map(async (item) => {
          const res = await fetch(item.url, { cache: 'no-store' });
          if (!res.ok) return null;
          return (await res.json()) as Application;
        }),
    );
    return apps
      .filter((item): item is Application => Boolean(item?.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const dir = path.join(dataDir(), 'applications');
    const names = await fs.readdir(dir);
    const apps = await Promise.all(
      names
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => readFsJson<Application>(`applications/${name}`)),
    );
    return apps
      .filter((item): item is Application => Boolean(item?.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function updateApplication(
  id: string,
  patch: Partial<Pick<Application, 'status'>>,
) {
  const current = await getApplication(id);
  if (!current) return null;
  const next: Application = { ...current, ...patch };
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
      const res = await fetch(asset.url);
      if (!res.ok) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, asset };
    }
    return null;
  }
}
