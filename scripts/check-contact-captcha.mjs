// Run with: node scripts/check-contact-captcha.mjs. All delivery calls are mocked.
import assert from 'node:assert/strict';
import { createDecipheriv, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const jar = new Map();
const cookieOptions = new Map();
const modules = new Map();
const secret = 'captcha-test-key-not-used-in-production';
const envNames = ['NODE_ENV', 'CONTACT_CAPTCHA_SECRET', 'RESEND_API_KEY', 'CAREERS_AUTH_SECRET',
  'STRIPE_SECRET_KEY', 'CONTACT_WEBHOOK_URL'];
const oldEnv = Object.fromEntries(envNames.map((key) => [key, process.env[key]]));
const oldFetch = globalThis.fetch;
const oldNow = Date.now;
let now = oldNow();
Date.now = () => now;

function load(relative) {
  const filename = resolve(root, relative);
  if (modules.has(filename)) return modules.get(filename);
  const module = { exports: {} };
  modules.set(filename, module.exports);
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      esModuleInterop: true },
  }).outputText;
  const localRequire = (name) => {
    if (name === 'next/headers') return { cookies: async () => ({
      get: (key) => jar.has(key) ? { value: jar.get(key) } : undefined,
      set: (key, value, options) => {
        cookieOptions.set(key, options);
        if (options.maxAge === 0) jar.delete(key);
        else jar.set(key, value);
      },
    }) };
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    return require(name);
  };
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports);
  modules.set(filename, module.exports);
  return module.exports;
}

function solution(token) {
  const [id, iv, encrypted, tag] = token.split('.');
  const key = createHash('sha256').update(`contact-captcha:v1:${secret}`).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from(id));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final(),
  ]).toString()).answer;
}

try {
  for (const key of envNames) delete process.env[key];
  process.env.NODE_ENV = 'production';
  process.env.CONTACT_CAPTCHA_SECRET = secret;
  const { createContactCaptcha, verifyContactCaptcha } = load('src/lib/contact-captcha.ts');
  const challenge = await createContactCaptcha();
  const answer = solution(challenge.token);
  assert.match(challenge.image, /^data:image\/png;base64,/);
  const cookieName = `cm_captcha_${challenge.token.split('.')[0]}`;
  const nonce = jar.get(cookieName);
  assert.deepEqual(cookieOptions.get(cookieName), {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/api/contact', maxAge: 300,
  });
  assert.equal(Buffer.from(challenge.token.split('.')[2], 'base64url').includes(Buffer.from(answer)), false);
  now += 1500;
  assert.equal(await verifyContactCaptcha(challenge.token, ` ${answer} `), true);
  assert.equal(jar.has(cookieName), false);
  jar.set(cookieName, nonce);
  assert.equal(await verifyContactCaptcha(challenge.token, answer), false, 'replay rejected');

  const wrong = await createContactCaptcha();
  const wrongAnswer = solution(wrong.token) === '000000' ? '111111' : '000000';
  now += 1500;
  assert.equal(await verifyContactCaptcha(wrong.token, wrongAnswer), false);
  assert.equal(await verifyContactCaptcha(wrong.token, solution(wrong.token)), false);

  const expired = await createContactCaptcha();
  now += 300001;
  assert.equal(await verifyContactCaptcha(expired.token, solution(expired.token)), false);
  const fast = await createContactCaptcha();
  assert.equal(await verifyContactCaptcha(fast.token, solution(fast.token)), false);
  const tampered = await createContactCaptcha();
  now += 1500;
  const segments = tampered.token.split('.');
  const bytes = Buffer.from(segments[2], 'base64url');
  bytes[0] ^= 1;
  segments[2] = bytes.toString('base64url');
  assert.equal(await verifyContactCaptcha(segments.join('.'), solution(tampered.token)), false);
  const unbound = await createContactCaptcha();
  jar.delete(`cm_captcha_${unbound.token.split('.')[0]}`);
  now += 1500;
  assert.equal(await verifyContactCaptcha(unbound.token, solution(unbound.token)), false);
  for (const token of [null, '', 'invalid', 'a'.repeat(1025)]) {
    assert.equal(await verifyContactCaptcha(token, '123456'), false);
  }

  let deliveries = [];
  globalThis.fetch = async (url, options) => {
    deliveries.push({ url, body: JSON.parse(options.body) });
    return new Response('{}', { status: 200 });
  };
  process.env.RESEND_API_KEY = 'mock-resend-key';
  process.env.CONTACT_WEBHOOK_URL = 'https://example.test/mock-webhook';
  const { POST } = load('src/app/api/contact/route.ts');
  const post = (payload) => POST(new Request('https://cluster.test/api/contact', {
    method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' },
  }));
  const lead = { nombre: 'Contacto de prueba', email: 'test@example.test', pais: 'Panamá' };
  for (const payload of [null, [], lead, { ...lead, captchaToken: 'forged', captchaAnswer: '123456' }]) {
    assert.equal((await post(payload)).status, 400);
  }
  assert.equal(deliveries.length, 0, 'direct submissions never deliver');
  const trapped = await createContactCaptcha();
  now += 1500;
  assert.equal((await post({ ...lead, captchaToken: trapped.token,
    captchaAnswer: solution(trapped.token), contactFax: 'spam' })).status, 400);
  assert.equal(deliveries.length, 0, 'honeypot never delivers');
  const valid = await createContactCaptcha();
  now += 1500;
  const result = await post({ ...lead, captchaToken: valid.token, captchaAnswer: solution(valid.token) });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).ok, true);
  assert.equal(deliveries.length, 2, 'valid contact reaches webhook and email');
  for (const delivery of deliveries) {
    assert.equal(JSON.stringify(delivery.body).includes('captcha'), false);
  }
  deliveries = [];
  delete process.env.CONTACT_CAPTCHA_SECRET;
  delete process.env.RESEND_API_KEY;
  await assert.rejects(createContactCaptcha(), /CONTACT_CAPTCHA_SECRET/);
  assert.equal(deliveries.length, 0);
  console.log('Contact captcha checks passed: valid delivery, missing/forged/wrong/expired/replayed codes, cookie binding, honeypot, and production config. No real messages sent.');
} finally {
  for (const [key, value] of Object.entries(oldEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = oldFetch;
  Date.now = oldNow;
}
