// Ejecuta las pruebas del LMS en un esquema desechable. Nunca usa las tablas públicas.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { neon } = require('@neondatabase/serverless');
require('@next/env').loadEnvConfig(process.cwd(), false, { info() {}, error() {} });

if (process.env.LMS_TEST_SCHEMA) {
  const schema = process.env.LMS_TEST_SCHEMA;
  if (!/^lms_test_[a-f0-9]+$/.test(schema)) throw new Error('Esquema de prueba inválido');
  const raw = neon(process.env.DATABASE_URL);
  const run = (query) => raw.transaction([raw`SELECT set_config('search_path', ${schema}, true)`, query]).then((r) => r[1]);
  const sql = (...args) => run(raw(...args));
  sql.query = (...args) => run(raw.query(...args));
  sql.transaction = (queries, options) => raw.transaction(
    (tx) => [tx`SELECT set_config('search_path', ${schema}, true)`, ...queries(tx)],
    options,
  ).then((results) => results.slice(1));
  const id = path.resolve('src/lib/crm/db.ts');
  require.cache[id] = { id, filename: id, loaded: true, exports: { crm: async () => sql } };
  const fetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = String(input);
    if (url.includes('api.stripe.com') || url.includes('api.resend.com') || url.includes('api-m.paypal.com')) {
      throw new Error('Las pruebas deben interceptar las pasarelas y los correos');
    }
    return fetch(input, init);
  };
} else {
  (async () => {
    const raw = neon(process.env.DATABASE_URL);
    const schema = 'lms_test_' + require('node:crypto').randomBytes(8).toString('hex');
    await raw.query(`CREATE SCHEMA ${schema}`);
    try {
      const source = fs.readFileSync('src/lib/crm/db.ts', 'utf8');
      const start = source.indexOf('const STATEMENTS = ') + 'const STATEMENTS = '.length;
      const statements = new Function('return ' + source.slice(start, source.indexOf('\n];', start) + 2))();
      await raw.transaction([raw`SELECT set_config('search_path', ${schema}, true)`, ...statements.map((s) => raw.query(s))]);
      const tests = process.argv.slice(2);
      for (const test of tests.length ? tests : ['check-academia.ts', 'check-lms-cierre.ts', 'check-seguimiento.ts', 'check-misiones-equipo.ts', 'check-lms-security.ts', 'check-academia-catalog.ts', 'check-academia-currency.ts', 'check-lms-access-delivery.ts', 'check-lms-authoring.ts', 'check-lms-student.ts', 'check-lms-certificates.ts']) {
        console.log(`\nPrueba aislada: ${test}`);
        const code = await new Promise((resolve) => {
          const child = spawn(process.execPath, ['--import', 'tsx', '--require', __filename, path.resolve('scripts', test)], {
            stdio: 'inherit', env: { ...process.env, LMS_TEST_SCHEMA: schema, NODE_ENV: 'test', CAREERS_AUTH_SECRET: 'lms-isolated-test-secret', STRIPE_SECRET_KEY: '', RESEND_API_KEY: 'test' },
          });
          child.on('exit', resolve);
          child.on('error', () => resolve(1));
        });
        if (code !== 0) { process.exitCode = 1; break; }
      }
    } finally {
      await raw.query(`DROP SCHEMA ${schema} CASCADE`);
      console.log('Esquema de prueba eliminado');
    }
  })().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
