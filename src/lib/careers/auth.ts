import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

const scrypt = promisify(scryptCb);

export const CAREERS_COOKIE = 'cluster_careers_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
const HASH_BLOB = 'careers/admin.json';
const HASH_FS = path.join(process.cwd(), 'data', 'careers', 'admin.json');
const HASH_TMP = path.join('/tmp', 'cluster-careers-admin.json');
const KEYLEN = 32;

type StoredHash = { salt: string; hash: string };

function envPassword() {
  return (process.env.CAREERS_ADMIN_PASSWORD || '').trim();
}

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

function hmac(value: string, key: string) {
  return createHmac('sha256', key).update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

async function readStoredHash(): Promise<StoredHash | null> {
  const token = blobToken();
  if (token) {
    try {
      const { blobs } = await list({
        token,
        prefix: HASH_BLOB,
        limit: 5,
      });
      const match = blobs.find((item) => item.pathname === HASH_BLOB);
      if (match) {
        const headers: HeadersInit = { Authorization: `Bearer ${token}` };
        const res = await fetch(match.url, { cache: 'no-store', headers });
        if (res.ok) return (await res.json()) as StoredHash;
      }
    } catch (error) {
      console.error('[careers] auth blob read failed:', error);
    }
  }

  for (const file of [HASH_FS, HASH_TMP]) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      return JSON.parse(raw) as StoredHash;
    } catch {
      /* missing */
    }
  }
  return null;
}

async function writeStoredHash(stored: StoredHash) {
  const json = JSON.stringify(stored);
  const file = process.env.VERCEL ? HASH_TMP : HASH_FS;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, json);

  if (blobToken()) {
    await put(HASH_BLOB, json, {
      ...blobAuth(),
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
  }
}

async function sessionSecret() {
  const env = (process.env.CAREERS_AUTH_SECRET || envPassword()).trim();
  if (env) return env;
  const stored = await readStoredHash();
  if (stored?.hash) return stored.hash;
  return 'cluster-careers-local';
}

export async function hasPassword() {
  if (envPassword()) return true;
  return Boolean(await readStoredHash());
}

export async function createPasswordHash(password: string): Promise<StoredHash> {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, KEYLEN)) as Buffer;
  return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}

export async function verifyPassword(password: string) {
  const env = envPassword();
  if (env) return safeEqual(password, env);

  const stored = await readStoredHash();
  if (!stored?.salt || !stored.hash) return false;
  const hash = (await scrypt(password, Buffer.from(stored.salt, 'hex'), KEYLEN)) as Buffer;
  const expected = Buffer.from(stored.hash, 'hex');
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}

export async function setupPassword(password: string) {
  if (envPassword()) return { ok: false as const, error: 'env_password' };
  if (await readStoredHash()) return { ok: false as const, error: 'already_setup' };
  await writeStoredHash(await createPasswordHash(password));
  return { ok: true as const };
}

export async function createSessionValue() {
  const issued = Date.now().toString();
  const secret = await sessionSecret();
  return `${issued}.${hmac(issued, secret)}`;
}

export async function verifySession(raw: string) {
  const [issued, signature] = raw.split('.');
  if (!issued || !signature) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > COOKIE_MAX_AGE * 1000) return false;
  const secret = await sessionSecret();
  return safeEqual(signature, hmac(issued, secret));
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function isAdminRequest() {
  const jar = await cookies();
  return verifySession(jar.get(CAREERS_COOKIE)?.value ?? '');
}

export async function unauthorizedIfGuest() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

export async function withSession(response: NextResponse) {
  response.cookies.set(CAREERS_COOKIE, await createSessionValue(), cookieOptions());
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(CAREERS_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
  return response;
}
