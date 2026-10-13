import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import sharp from 'sharp';
import { cookies } from 'next/headers';

const TTL = 5 * 60 * 1000;
const usedChallenges = new Map<string, number>();

function encryptionKey() {
  const secret = process.env.CONTACT_CAPTCHA_SECRET || process.env.RESEND_API_KEY ||
    process.env.CAREERS_AUTH_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('CONTACT_CAPTCHA_SECRET is required');
  }
  return createHash('sha256').update(`contact-captcha:v1:${secret || 'local-development-only'}`).digest();
}

function pruneChallenges(now: number) {
  for (const [id, expires] of usedChallenges) {
    if (expires <= now) usedChallenges.delete(id);
  }
}

export async function createContactCaptcha() {
  const key = encryptionKey();
  const id = randomBytes(16).toString('hex');
  const nonce = randomBytes(24).toString('hex');
  const answer = Array.from({ length: 6 }, () => randomInt(10)).join('');
  const issued = Date.now();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(id));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ answer, nonce, issued }), 'utf8'), cipher.final(),
  ]);
  const token = [id, iv.toString('base64url'), encrypted.toString('base64url'),
    cipher.getAuthTag().toString('base64url')].join('.');

  // Only the raster image leaves the server; SVG text would expose the answer.
  const digits = [...answer].map((digit, index) => {
    const x = 23 + index * 33;
    const y = randomInt(43, 52);
    return `<text x="${x}" y="${y}" transform="rotate(${randomInt(-14, 15)} ${x} ${y})" font-family="sans-serif" font-size="36" font-weight="700" fill="#172d24">${digit}</text>`;
  }).join('');
  const noise = Array.from({ length: 7 }, () =>
    `<path d="M${randomInt(240)} ${randomInt(72)} Q${randomInt(240)} ${randomInt(72)} ${randomInt(240)} ${randomInt(72)}" stroke="#2e7d32" opacity="0.3" fill="none"/>`,
  ).join('');
  const image = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="72"><rect width="240" height="72" fill="#f4f6ef"/>${digits}${noise}</svg>`,
  )).png().toBuffer();

  const jar = await cookies();
  jar.set(`cm_captcha_${id}`, nonce, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', path: '/api/contact', maxAge: TTL / 1000,
  });
  return { token, image: `data:image/png;base64,${image.toString('base64')}` };
}

export async function verifyContactCaptcha(token: unknown, answer: unknown) {
  if (typeof token !== 'string' || token.length > 1024 || typeof answer !== 'string') return false;
  const parts = token.split('.');
  const [id, iv, encrypted, tag] = parts;
  if (parts.length !== 4 || !/^[a-f0-9]{32}$/.test(id)) return false;
  const jar = await cookies();
  const cookieName = `cm_captcha_${id}`;
  const nonce = jar.get(cookieName)?.value;
  if (!nonce) return false;
  jar.set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', path: '/api/contact', maxAge: 0 });

  try {
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
    decipher.setAAD(Buffer.from(id));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const decoded = JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final(),
    ]).toString('utf8')) as { answer: string; nonce: string; issued: number };
    const now = Date.now();
    if (decoded.nonce !== nonce || !Number.isFinite(decoded.issued) ||
        decoded.issued > now || now - decoded.issued >= TTL) return false;
    pruneChallenges(now);
    // Consume before checking the answer: one guess per challenge on this worker.
    // Cross-worker replay/rate limits require shared storage or a hosting firewall.
    if (usedChallenges.has(id) || usedChallenges.size >= 5000) return false;
    usedChallenges.set(id, decoded.issued + TTL);
    const normalized = answer.trim();
    return now - decoded.issued >= 1000 && /^\d{6}$/.test(normalized) &&
      timingSafeEqual(Buffer.from(normalized), Buffer.from(decoded.answer));
  } catch {
    return false;
  }
}
