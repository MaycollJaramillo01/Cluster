import assert from 'node:assert/strict';

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Usa npm run test:lms para aislar los datos');
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const sql = await crm();
  const { issueCourseCertificate, listCertificates, ownedCertificate, verifyCertificate } = await import('@/lib/valux/certificates');
  const { requestCertificate, setCertificateSharing } = await import('@/lib/valux/certificate-actions');
  const { academiaCookieValue, ACADEMIA_COOKIE } = await import('@/lib/valux/session');
  let signed = '';
  require('next/headers').cookies = async () => ({ get: (name: string) => name === ACADEMIA_COOKIE && signed ? { value: signed } : undefined });
  require('next/cache').revalidatePath = () => {};
  const load = (fields: Record<string, string>) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.set(key, value);
    return form;
  };
  const redirectedTo = (path: string) => (error: unknown) =>
    String((error as { digest?: string })?.digest || '').split(';')[2] === path;

  await sql`INSERT INTO valux_people (id, name, email) VALUES
    ('cert-a', 'Ana Núñez', 'cert-a@example.test'), ('cert-b', 'Otra persona', 'cert-b@example.test')`;
  await sql`INSERT INTO lms_courses (id, slug, title, price_cents, published) VALUES
    ('cert-course', 'cert-course', 'Medición aplicada', 10000, true), ('cert-empty', 'cert-empty', 'Sin clases', 0, true)`;
  await sql`INSERT INTO lms_enrollments (id, course_id, person_id) VALUES ('cert-access', 'cert-course', 'cert-a')`;
  await sql`INSERT INTO lms_lessons (id, course_id, slug, title, mission, sort_order) VALUES
    ('cert-plain', 'cert-course', 'primer', 'Primera clase', '', 1),
    ('cert-quiz', 'cert-course', 'quiz', 'Cuestionario', ${'¿Dos?\n* 2\n- 3'}, 2),
    ('cert-task', 'cert-course', 'tarea', 'Tarea', ${'[tarea]\r\nExplica cómo aplicarías lo aprendido.'}, 3)`;
  await assert.rejects(requestCertificate(load({ course: 'cert-course' })), redirectedTo('/academia/entrar'));
  assert.deepEqual(await issueCourseCertificate('cert-b', 'cert-course'), { error: 'acceso' });
  assert.deepEqual(await issueCourseCertificate('cert-a', 'cert-empty'), { error: 'incompleto' });
  assert.deepEqual(await issueCourseCertificate('cert-a', 'cert-course'), { error: 'incompleto' });
  await sql`INSERT INTO lms_progress (id, person_id, lesson_id, completed_at) VALUES
    ('cert-done-plain', 'cert-a', 'cert-plain', '2025-02-04T12:00:00Z'),
    ('cert-done-quiz', 'cert-a', 'cert-quiz', '2025-02-05T12:00:00Z'),
    ('cert-done-task', 'cert-a', 'cert-task', '2025-02-06T12:00:00Z')`;
  await sql`INSERT INTO lms_assignment_submissions (lesson_id, person_id, response) VALUES ('cert-task', 'cert-a', 'Respuesta de prueba')`;
  assert.deepEqual(await issueCourseCertificate('cert-a', 'cert-course'), { error: 'incompleto' });
  await sql`INSERT INTO lms_xp (person_id, lesson_id, xp) VALUES ('cert-a', 'cert-quiz', 10)`;
  assert.deepEqual(await issueCourseCertificate('cert-a', 'cert-course'), { error: 'incompleto' });
  await sql`UPDATE lms_assignment_submissions SET status = 'aprobada' WHERE lesson_id = 'cert-task' AND person_id = 'cert-a'`;
  const [first, retry] = await Promise.all([issueCourseCertificate('cert-a', 'cert-course'), issueCourseCertificate('cert-a', 'cert-course')]);
  assert.ok(first.id);
  assert.deepEqual(first, retry);
  const id = first.id;
  const privatePath = `/academia/constancias/${id}`;
  assert.equal((await listCertificates('cert-a')).length, 1);
  assert.equal((await listCertificates('cert-b')).length, 0);
  assert.equal(await ownedCertificate('cert-b', id), null);
  assert.equal(await verifyCertificate(id), null);
  const issued = await ownedCertificate('cert-a', id);
  assert.equal(issued?.student_name, 'Ana Núñez');
  assert.equal(issued?.lesson_count, 3);
  assert.equal(new Date(issued!.completed_at).toISOString(), '2025-02-06T12:00:00.000Z');
  assert.equal(issued?.share_code, null);
  console.log('OK Constancia única luego de completar todo y aprobar las actividades');

  signed = academiaCookieValue('cert-b');
  await assert.rejects(setCertificateSharing(load({ id, share: '1' })), redirectedTo('/academia/constancias'));
  signed = academiaCookieValue('cert-a');
  await assert.rejects(requestCertificate(load({ course: 'cert-course' })), redirectedTo(privatePath));
  await assert.rejects(setCertificateSharing(load({ id, share: '1' })), redirectedTo(privatePath));
  const code = (await ownedCertificate('cert-a', id))!.share_code;
  assert.ok(code && code !== id);
  assert.deepEqual(Object.keys((await verifyCertificate(code))!).sort(), ['completed_at', 'course_title', 'id', 'issued_at', 'lesson_count', 'student_name']);
  await assert.rejects(setCertificateSharing(load({ id, share: '0' })), redirectedTo(privatePath));
  assert.equal(await verifyCertificate(code), null);
  await assert.rejects(setCertificateSharing(load({ id, share: '1' })), redirectedTo(privatePath));
  assert.notEqual((await ownedCertificate('cert-a', id))?.share_code, code);
  assert.equal(await verifyCertificate(code), null);
  await sql`UPDATE lms_courses SET title = 'Título editado', published = false WHERE id = 'cert-course'`;
  await sql`UPDATE valux_people SET name = 'Nombre editado' WHERE id = 'cert-a'`;
  const stable = await ownedCertificate('cert-a', id);
  assert.equal(stable?.course_title, 'Medición aplicada');
  assert.equal(stable?.student_name, 'Ana Núñez');
  console.log('OK Privada por defecto, control del titular, verificación revocable y datos de emisión estables');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
