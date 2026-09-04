import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';
import type { PublicUser, UserRole, UserStatus } from './types';

const scrypt = promisify(scryptCb);

export const CAREERS_COOKIE = 'cluster_careers_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
const USERS_BLOB = 'careers/users.json';
const USERS_FS = path.join(process.cwd(), 'data', 'careers', 'users.json');
const USERS_TMP = path.join('/tmp', 'cluster-careers-users.json');
const KEYLEN = 32;
const RESET_TTL_MS = 60 * 60 * 1000;

export const DEFAULT_ADMIN_EMAILS = [
  'leandromatiasdgonz@gmail.com',
  'info@cluster.marketing',
] as const;

export type { PublicUser, UserRole, UserStatus };

type AdminRecord = PublicUser & {
  salt: string;
  hash: string;
};

type ResetRecord = {
  email: string;
  tokenHash: string;
  expiresAt: number;
};

type AuthFile = {
  users: AdminRecord[];
  resets: ResetRecord[];
};

export type SessionUser = {
  email: string;
  name: string;
  role: UserRole;
  pendingCount: number;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 80);
}

function extraEmails() {
  return (process.env.CAREERS_ADMIN_EMAILS || '')
    .split(',')
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

export function ownerEmails() {
  return [...new Set([...DEFAULT_ADMIN_EMAILS, ...extraEmails()])];
}

export function isOwnerEmail(email: string) {
  return ownerEmails().includes(normalizeEmail(email));
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

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
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

function sessionSecret() {
  return (
    process.env.CAREERS_AUTH_SECRET ||
    process.env.CAREERS_ADMIN_PASSWORD ||
    'cluster-careers-session-v2'
  ).trim();
}

function toPublic(user: AdminRecord): PublicUser {
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function hydrateUser(raw: Partial<AdminRecord> & { email?: string }): AdminRecord | null {
  const email = normalizeEmail(String(raw.email ?? ''));
  if (!email) return null;
  const owner = isOwnerEmail(email);
  const status: UserStatus =
    owner
      ? 'approved'
      : raw.status === 'pending' || raw.status === 'rejected' || raw.status === 'approved'
        ? raw.status
        : 'approved';
  return {
    email,
    name: normalizeName(String(raw.name ?? '')),
    role: owner ? 'owner' : 'member',
    status,
    salt: String(raw.salt ?? ''),
    hash: String(raw.hash ?? ''),
    createdAt: String(raw.createdAt || raw.updatedAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
  };
}

async function emptyAuth(): Promise<AuthFile> {
  return { users: [], resets: [] };
}

async function readAuthFile(): Promise<AuthFile> {
  const parse = (data: Partial<AuthFile>): AuthFile => ({
    users: (Array.isArray(data.users) ? data.users : [])
      .map((item) => hydrateUser(item))
      .filter((item): item is AdminRecord => Boolean(item)),
    resets: Array.isArray(data.resets) ? data.resets : [],
  });

  const token = blobToken();
  if (token) {
    try {
      const { blobs } = await list({ token, prefix: USERS_BLOB, limit: 5 });
      const match = blobs.find((item) => item.pathname === USERS_BLOB);
      if (match) {
        const res = await fetch(match.url, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          return parse((await res.json()) as Partial<AuthFile>);
        }
      }
    } catch (error) {
      console.warn('[careers] auth blob read skipped:', error);
    }
  }

  for (const file of [USERS_FS, USERS_TMP]) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      return parse(JSON.parse(raw) as Partial<AuthFile>);
    } catch {
      /* missing */
    }
  }
  return emptyAuth();
}

async function writeAuthFile(file: AuthFile) {
  const json = JSON.stringify(file, null, 2);
  const dest = process.env.VERCEL ? USERS_TMP : USERS_FS;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, json);

  if (blobToken()) {
    try {
      await put(USERS_BLOB, json, {
        ...blobAuth(),
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
    } catch (error) {
      console.warn('[careers] auth blob write skipped:', error);
    }
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, KEYLEN)) as Buffer;
  return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}

async function passwordMatches(password: string, record: AdminRecord) {
  if (!record.salt || !record.hash) return false;
  const hash = (await scrypt(password, Buffer.from(record.salt, 'hex'), KEYLEN)) as Buffer;
  const expected = Buffer.from(record.hash, 'hex');
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}

function findUser(file: AuthFile, email: string) {
  const normalized = normalizeEmail(email);
  return file.users.find((item) => item.email === normalized);
}

export type EmailLookup = 'unknown' | 'setup' | 'password' | 'pending' | 'rejected';

export async function lookupEmail(email: string): Promise<EmailLookup> {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'unknown';
  const file = await readAuthFile();
  const user = findUser(file, normalized);
  if (!user) return isOwnerEmail(normalized) ? 'setup' : 'unknown';
  if (user.status === 'pending') return 'pending';
  if (user.status === 'rejected') return 'rejected';
  return user.hash ? 'password' : 'setup';
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function registerUser(input: { email: string; password: string; name: string }) {
  const email = normalizeEmail(input.email);
  const name = normalizeName(input.name);
  if (!validEmail(email)) return { ok: false as const, error: 'invalid_email' };
  if (name.length < 2) return { ok: false as const, error: 'name_required' };
  if (input.password.length < 8) return { ok: false as const, error: 'password_too_short' };

  const file = await readAuthFile();
  const existing = findUser(file, email);
  if (existing) {
    if (existing.status === 'pending') return { ok: false as const, error: 'pending' };
    if (existing.status === 'rejected') return { ok: false as const, error: 'rejected' };
    return { ok: false as const, error: 'already_registered' };
  }

  const hashed = await hashPassword(input.password);
  const now = new Date().toISOString();
  const owner = isOwnerEmail(email);
  const user: AdminRecord = {
    email,
    name,
    role: owner ? 'owner' : 'member',
    status: owner ? 'approved' : 'pending',
    ...hashed,
    createdAt: now,
    updatedAt: now,
  };
  file.users.push(user);
  await writeAuthFile(file);

  if (owner) {
    return { ok: true as const, email, name, status: 'approved' as const, authed: true as const };
  }
  return { ok: true as const, email, name, status: 'pending' as const, authed: false as const };
}

export async function setupUserPassword(email: string, password: string, name = '') {
  const normalized = normalizeEmail(email);
  if (!isOwnerEmail(normalized)) return { ok: false as const, error: 'unknown_email' };
  if (password.length < 8) return { ok: false as const, error: 'password_too_short' };
  const displayName = normalizeName(name);
  if (displayName.length < 2) return { ok: false as const, error: 'name_required' };

  const file = await readAuthFile();
  const existing = findUser(file, normalized);
  if (existing?.hash) return { ok: false as const, error: 'already_setup' };

  const hashed = await hashPassword(password);
  const now = new Date().toISOString();
  const next: AdminRecord = {
    email: normalized,
    name: displayName,
    role: 'owner',
    status: 'approved',
    ...hashed,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  file.users = file.users.filter((item) => item.email !== normalized);
  file.users.push(next);
  await writeAuthFile(file);
  return { ok: true as const, email: normalized, name: displayName };
}

export async function loginUser(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const file = await readAuthFile();
  const user = findUser(file, normalized);
  if (!user) {
    if (isOwnerEmail(normalized)) return { ok: false as const, error: 'needs_setup' };
    return { ok: false as const, error: 'invalid_login' };
  }
  if (user.status === 'pending') return { ok: false as const, error: 'pending' };
  if (user.status === 'rejected' || user.status !== 'approved') {
    return { ok: false as const, error: 'invalid_login' };
  }
  if (!user.hash) return { ok: false as const, error: 'needs_setup' };
  if (!(await passwordMatches(password, user))) {
    return { ok: false as const, error: 'invalid_login' };
  }
  return { ok: true as const, email: user.email, name: user.name, role: user.role };
}

export async function createResetToken(email: string) {
  const normalized = normalizeEmail(email);
  const file = await readAuthFile();
  const user = findUser(file, normalized);
  if (!user || user.status !== 'approved') return { ok: true as const, token: '' };

  const token = randomBytes(32).toString('hex');
  file.resets = file.resets.filter(
    (item) => item.email !== normalized && item.expiresAt > Date.now(),
  );
  file.resets.push({
    email: normalized,
    tokenHash: sha256(token),
    expiresAt: Date.now() + RESET_TTL_MS,
  });
  await writeAuthFile(file);
  return { ok: true as const, token };
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8) return { ok: false as const, error: 'password_too_short' };
  const tokenHash = sha256(token);
  const file = await readAuthFile();
  const match = file.resets.find(
    (item) => item.tokenHash === tokenHash && item.expiresAt > Date.now(),
  );
  if (!match) return { ok: false as const, error: 'invalid_token' };

  const current = findUser(file, match.email);
  if (!current || current.status !== 'approved') {
    return { ok: false as const, error: 'invalid_token' };
  }

  const hashed = await hashPassword(password);
  file.users = file.users.filter((item) => item.email !== match.email);
  file.users.push({
    ...current,
    ...hashed,
    updatedAt: new Date().toISOString(),
  });
  file.resets = file.resets.filter((item) => item.tokenHash !== tokenHash);
  await writeAuthFile(file);
  return { ok: true as const, email: current.email, name: current.name };
}

export async function listUsers() {
  const file = await readAuthFile();
  return file.users
    .map(toPublic)
    .sort((a, b) => {
      const rank = (item: PublicUser) =>
        item.status === 'pending' ? 0 : item.role === 'owner' ? 1 : 2;
      const delta = rank(a) - rank(b);
      if (delta !== 0) return delta;
      return a.name.localeCompare(b.name) || a.email.localeCompare(b.email);
    });
}

export async function updateUser(input: {
  actorEmail: string;
  email: string;
  name?: string;
  status?: UserStatus;
}) {
  const actor = normalizeEmail(input.actorEmail);
  const email = normalizeEmail(input.email);
  const file = await readAuthFile();
  const actorUser = findUser(file, actor);
  if (!actorUser || actorUser.status !== 'approved') {
    return { ok: false as const, error: 'unauthorized' };
  }

  const target = findUser(file, email);
  if (!target) return { ok: false as const, error: 'not_found' };

  const isSelf = actor === email;
  const actorIsOwner = actorUser.role === 'owner';
  if (!isSelf && !actorIsOwner) return { ok: false as const, error: 'forbidden' };

  let next = { ...target };

  if (typeof input.name === 'string') {
    const name = normalizeName(input.name);
    if (name.length < 2) return { ok: false as const, error: 'name_required' };
    next.name = name;
  }

  if (input.status) {
    if (!actorIsOwner) return { ok: false as const, error: 'forbidden' };
    if (target.role === 'owner') return { ok: false as const, error: 'protected' };
    next.status = input.status;
  }

  next.updatedAt = new Date().toISOString();
  file.users = file.users.map((item) => (item.email === email ? next : item));
  await writeAuthFile(file);
  return { ok: true as const, user: toPublic(next), previousStatus: target.status };
}

function encodeSession(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ iat: Date.now(), email: normalizeEmail(email) }),
  ).toString('base64url');
  return `${payload}.${hmac(payload, sessionSecret())}`;
}

function decodeSession(raw: string): { email: string } | null {
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  if (!safeEqual(signature, hmac(payload, sessionSecret()))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      iat?: number;
      email?: string;
    };
    const age = Date.now() - Number(data.iat ?? 0);
    if (!Number.isFinite(age) || age < 0 || age > COOKIE_MAX_AGE * 1000) return null;
    const email = normalizeEmail(String(data.email ?? ''));
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
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

export async function readAdminSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const decoded = decodeSession(jar.get(CAREERS_COOKIE)?.value ?? '');
  if (!decoded) return null;
  const file = await readAuthFile();
  const user = findUser(file, decoded.email);
  if (!user || user.status !== 'approved') return null;
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    pendingCount:
      user.role === 'owner'
        ? file.users.filter((item) => item.status === 'pending').length
        : 0,
  };
}

export async function isAdminRequest() {
  return Boolean(await readAdminSession());
}

export async function unauthorizedIfGuest() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

export async function unauthorizedIfNotOwner() {
  const session = await readAdminSession();
  if (session?.role === 'owner') return null;
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

export function withSession(response: NextResponse, email: string) {
  response.cookies.set(CAREERS_COOKIE, encodeSession(email), cookieOptions());
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(CAREERS_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
  return response;
}
