// Verificación del doble opt-in del acuerdo de proveedores.
// Uso: node scripts/check-supplier-agreement.mjs   (Node 22.18+; lee el .ts directamente)
import assert from 'node:assert/strict';
import {
  agreementHash,
  agreementText,
  openResponse,
  parseSubmission,
  sealResponse,
  supplierAgreement,
} from '../src/lib/supplier-agreement.ts';

const input = {
  fullName: '  María   José Pérez ',
  idNumber: '0801-1990-12345',
  email: ' Maria@Example.com ',
  phone: '+504 9999-0000',
  decision: 'si',
  supplier: 'Foto Estudio',
};

// Validación: limpia los datos y rechaza cada campo inválido.
const fields = parseSubmission(input);
assert.deepEqual(fields, {
  fullName: 'María José Pérez',
  idNumber: '0801-1990-12345',
  email: 'maria@example.com',
  phone: '+504 9999-0000',
  decision: 'si',
  supplier: 'Foto Estudio',
});
for (const [field, value, error] of [
  ['fullName', 'A', 'invalid_full_name'],
  ['idNumber', '12-3', 'invalid_id_number'],
  ['email', 'sin-arroba.com', 'invalid_email'],
  ['phone', '12345', 'invalid_phone'],
  ['decision', 'tal vez', 'invalid_decision'],
]) {
  assert.deepEqual(parseSubmission({ ...input, [field]: value }), { error });
}

// Token: ida y vuelta, sin datos legibles, y rechazo si se altera o vence.
const response = {
  ...fields,
  submittedAt: new Date().toISOString(),
  submitIp: '203.0.113.7',
  submitUserAgent: 'check',
  textHash: agreementHash(),
};
const token = sealResponse(response);
assert.deepEqual(openResponse(token), response);
assert.ok(!Buffer.from(token, 'base64url').toString('latin1').includes('0801'));

const flipped = token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A');
assert.equal(openResponse(flipped), null);
assert.equal(openResponse(''), null);
assert.equal(openResponse('no-es-un-token'), null);
assert.equal(openResponse(token, Date.now() + 8 * 24 * 60 * 60 * 1000), null);
assert.equal(openResponse(sealResponse({ ...response, textHash: 'texto-anterior' })), null);

// El correo de constancia incluye el acuerdo completo y la declaración aceptada.
const text = agreementText();
for (const section of supplierAgreement.sections) assert.ok(text.includes(section.title.toUpperCase()));
assert.ok(text.endsWith(supplierAgreement.acceptance));

console.log('supplier-agreement: ok');
