export {};

// Prueba de misiones, XP, desbloqueo, TOTP y roles del panel contra la base de .env.local.
// Uso: npx tsx --env-file=.env.local scripts/check-misiones-equipo.ts
// Crea filas con un prefijo único y las borra al final.

function check(label: string, ok: boolean) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  // Fuera de Next no hay request: connection() se anula para la prueba.
  const req = require('next/server');
  req.connection = async () => {};
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const { gradeMission, parseMission, publicMission } = await import('@/lib/valux/mission');
  const { currentStep, totpCode, verifyTotp } = await import('@/lib/crm/totp');
  const { areaForPath, canDo } = await import('@/lib/crm/roles');
  const { checkMfa, pendingSecret } = await import('@/lib/crm/mfa');
  const { lessonAccess } = await import('@/lib/valux/data');

  // Misiones (puro).
  const quiz = parseMission('¿Uno?\n- a\n* b\n\n¿Dos?\n* c\n- d');
  if (quiz.mission?.kind !== 'quiz') throw new Error('No se pudo preparar el quiz de prueba');
  check('quiz se lee', quiz.mission?.kind === 'quiz' && quiz.mission.questions.length === 2);
  const answers: Record<string, string> = { q0: '1', q1: '0' };
  check('quiz correcto aprueba', gradeMission(quiz.mission!, (key) => answers[key] || '').passed);
  check('quiz con un error no aprueba', !gradeMission(quiz.mission!, (key) => ({ q0: '0', q1: '0' } as Record<string, string>)[key] || '').passed);
  check('el alumno no recibe la respuesta', !JSON.stringify(publicMission(quiz.mission!)).includes('answer'));
  check('pregunta sin correcta da error', parseMission('¿X?\n- a\n- b').errors.length === 1);
  const list = parseMission('[ ] uno\n[ ] dos');
  if (list.mission?.kind !== 'checklist') throw new Error('No se pudo preparar la checklist de prueba');
  check('checklist incompleta no aprueba', !gradeMission(list.mission!, (key) => (key === 'item0' ? '1' : '')).passed);
  check('checklist completa aprueba', gradeMission(list.mission!, () => '1').passed);

  // TOTP: vector de la RFC 6238 (secreto "12345678901234567890", T=59 s).
  check('TOTP coincide con la RFC', totpCode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 1) === '287082');
  check('TOTP no acepta un paso ya usado', verifyTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '287082', 1, 59_000) === null);

  // Roles (puro).
  check('finanzas no entra a cursos', !canDo('finanzas', areaForPath('/dashboard/cursos/abc')!));
  check('finanzas entra a ventas', canDo('finanzas', areaForPath('/dashboard/cursos/ventas')!));
  check('contenido no entra a ventas', !canDo('contenido', areaForPath('/dashboard/cursos/ventas')!));
  check('profesor no entra a contactos', !canDo('profesor', areaForPath('/dashboard/contactos')!));
  check('comprobante es de finanzas', areaForPath('/dashboard/comprobante/1') === 'finanzas');
  check('login es libre', areaForPath('/dashboard/login/mfa') === null);

  const sql = await crm();
  const tag = `t${Date.now()}`;
  const email = `${tag}@example.test`;
  const personId = `${tag}-p`;
  const courseId = `${tag}-c`;
  try {
    // Segundo factor: alta, repetición y bloqueo.
    const secret = await pendingSecret(email);
    const code = totpCode(secret, currentStep());
    check('alta de 2FA con código válido', (await checkMfa(email, code)) === 'ok');
    check('el mismo código no sirve dos veces', (await checkMfa(email, code)) === 'bad');
    let last = '';
    for (let i = 0; i < 5; i += 1) last = await checkMfa(email, '000000');
    check('5 códigos malos bloquean', last === 'locked');
    check('bloqueado rechaza aunque el código sea bueno', (await checkMfa(email, totpCode(secret, currentStep() + 1))) === 'locked');

    // Desbloqueo y XP único.
    await sql`INSERT INTO valux_people (id, name, email) VALUES (${personId}, 'Prueba', ${email})`;
    await sql`INSERT INTO lms_courses (id, slug, title, price_cents, published) VALUES (${courseId}, ${courseId}, 'C', 0, true)`;
    const lessons = ['a', 'b', 'c'].map((slug, index) => ({ id: `${tag}-${slug}`, slug, section_id: '', sort: index }));
    for (const lesson of lessons) {
      await sql`INSERT INTO lms_lessons (id, course_id, slug, title, sort_order) VALUES (${lesson.id}, ${courseId}, ${lesson.slug}, ${lesson.slug}, ${lesson.sort})`;
    }
    const course = { id: courseId, teacher_id: '', sections: [], lessons };
    let access = await lessonAccess(personId, course);
    check('solo la primera clase abierta', access.unlocked.size === 1 && access.unlocked.has(lessons[0].id));
    await sql`INSERT INTO lms_progress (id, person_id, lesson_id, completed_at) VALUES (${crypto.randomUUID()}, ${personId}, ${lessons[0].id}, now())`;
    access = await lessonAccess(personId, course);
    check('completar la 1 abre la 2 y no la 3', access.unlocked.has(lessons[1].id) && !access.unlocked.has(lessons[2].id));
    for (let i = 0; i < 2; i += 1) {
      await sql`INSERT INTO lms_xp (person_id, lesson_id, xp) VALUES (${personId}, ${lessons[0].id}, 10) ON CONFLICT (person_id, lesson_id) DO NOTHING`;
    }
    const xp = await sql`SELECT sum(xp) AS xp FROM lms_xp WHERE person_id = ${personId}`;
    check('XP se acredita una sola vez', Number((xp[0] as { xp: unknown }).xp) === 10);
  } finally {
    await sql`DELETE FROM lms_xp WHERE person_id = ${personId}`;
    await sql`DELETE FROM lms_progress WHERE person_id = ${personId}`;
    await sql`DELETE FROM lms_courses WHERE id = ${courseId}`;
    await sql`DELETE FROM valux_people WHERE id = ${personId}`;
    await sql`DELETE FROM crm_mfa WHERE email = ${email}`;
    console.log('limpieza lista');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
