import assert from 'node:assert/strict';

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

async function redirected(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    const digest = (error as { digest?: string }).digest || '';
    if (!digest.startsWith('NEXT_REDIRECT;')) throw error;
    return digest.split(';')[2];
  }
  throw new Error('Se esperaba una redirección');
}

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Usa npm run test:lms para aislar los datos');
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const sql = await crm();
  const cookies = new Map<string, string>();
  require('next/headers').cookies = async () => ({
    get: (name: string) => cookies.has(name) ? { value: cookies.get(name) } : undefined,
  });
  require('next/cache').revalidatePath = () => {};
  const { issueSession, PRIMARY_ADMIN, SESSION_COOKIE } = await import('@/lib/crm/session');
  const { ACADEMIA_COOKIE, academiaCookieValue } = await import('@/lib/valux/session');
  const { createCourseRevision, publishCourseRevision } = await import('@/lib/crm/course-revisions');
  const { deleteLesson, requestReview, setCoursePublication, startCourseRevision } = await import('@/lib/crm/lms-actions');
  const { canReadCourse, myCourses, ownsCourse, publishedCourse } = await import('@/lib/valux/data');
  const { postLessonQuestion, answerLessonQuestion, saveCourseReview, moderateCourseReview } = await import('@/lib/valux/community-actions');
  const { getLessonQuestions, getCourseReviews, listReviewsForModeration } = await import('@/lib/valux/course-community');
  const { courseAccessRequests } = await import('@/lib/crm/course-access-requests');
  const { requestCourseAccessChange, resolveCourseAccessChange } = await import('@/lib/crm/course-access-request-actions');
  const { courseLessonReports, courseQuizAttempts, courseStudentProgress, progressCsv } = await import('@/lib/crm/course-reports');
  const { GET: download } = await import('@/app/api/academia/descargas/[kind]/[id]/route');

  const teacher = 'versiones-profesor@example.test';
  const otherTeacher = 'versiones-otro@example.test';
  const draftData = form({ course_id: 'versiones-curso' });
  const signIn = (role: 'profesor' | 'superadmin', email: string) => cookies.set(SESSION_COOKIE, issueSession(email, email, role));
  const signInStudent = (id: string) => cookies.set(ACADEMIA_COOKIE, academiaCookieValue(id));
  const request = () => download(new Request('https://example.test'), { params: Promise.resolve({ kind: 'recurso', id: 'versiones-plantilla' }) });
  await sql`INSERT INTO crm_staff (email, name, role) VALUES (${teacher}, 'Profesor QA', 'profesor'), (${otherTeacher}, 'Otro profesor QA', 'profesor')`;
  await sql`INSERT INTO valux_people (id, name, email, role) VALUES
    ('versiones-teacher','Profesor QA',${teacher},'profesor'),
    ('versiones-otro','Otro profesor QA',${otherTeacher},'profesor'),
    ('versiones-a','=Fórmula QA','versiones-a@example.test','usuario'),
    ('versiones-b','Sin inscripción','versiones-b@example.test','usuario')`;
  await sql`INSERT INTO lms_courses (id, slug, title, description, teacher_id, published, price_cents)
    VALUES ('versiones-curso','versiones-qa','Versión vigente','Curso de prueba','versiones-teacher',true,30000)`;
  await sql`INSERT INTO lms_sections (id,course_id,title) VALUES ('versiones-mod','versiones-curso','Módulo inicial')`;
  await sql`INSERT INTO lms_lessons (id,course_id,section_id,slug,title,content,mission,preview_public) VALUES
    ('versiones-first','versiones-curso','versiones-mod','primera','Primera clase','Contenido publicado',${'¿Qué mides?\n* Reservas\n- Nada'},true)`;
  await sql`INSERT INTO lms_resources (id,lesson_id,kind,title,content) VALUES
    ('versiones-plantilla','versiones-first','plantilla-txt','Plantilla privada','FICHA PRIVADA')`;
  await sql`INSERT INTO lms_enrollments (id,course_id,person_id) VALUES ('versiones-enrollment','versiones-curso','versiones-a')`;
  await sql`INSERT INTO lms_progress (id,person_id,lesson_id,completed_at) VALUES ('versiones-done','versiones-a','versiones-first',now())`;

  signIn('profesor', otherTeacher);
  assert.equal(await redirected(() => startCourseRevision(draftData)), '/dashboard/profesor');
  signIn('profesor', teacher);
  assert.equal(await redirected(() => startCourseRevision(draftData)), '/dashboard/cursos/versiones-curso?vista=revision&guardado=borrador');
  const drafts = await sql`SELECT id FROM lms_courses WHERE revision_of = 'versiones-curso' AND teacher_id = 'versiones-teacher' AND NOT published`;
  assert.equal(drafts.length, 1);
  const draftId = drafts[0].id;
  assert.equal(await createCourseRevision('versiones-curso', 'versiones-teacher'), draftId);
  const [copy] = await sql`SELECT id FROM lms_lessons WHERE course_id = ${draftId} AND source_id = 'versiones-first'`;
  assert.match(await redirected(() => deleteLesson(form({ course_id: draftId, id: copy.id }))), /error=conservar/);
  await sql`UPDATE lms_courses SET title = 'Versión dos' WHERE id = ${draftId}`;
  await sql`INSERT INTO lms_sections (id,course_id,title,sort_order) VALUES ('versiones-mod2',${draftId},'Módulo nuevo',2)`;
  await sql`INSERT INTO lms_lessons (id,course_id,section_id,slug,title,content,sort_order)
    VALUES ('versiones-second',${draftId},'versiones-mod2','segunda','Segunda clase','Contenido nuevo',2)`;
  assert.equal((await publishedCourse('versiones-qa'))?.title, 'Versión vigente');
  assert.equal(await publishedCourse(`borrador-${draftId}`), null);
  await requestReview(form({ course_id: draftId }));
  const publication = form({ id: draftId, publication: 'publish' });
  assert.equal(await redirected(() => setCoursePublication(publication)), '/dashboard/profesor');
  signIn('superadmin', PRIMARY_ADMIN);
  assert.match(await redirected(() => setCoursePublication(publication)), /guardado=version/);
  const live = await publishedCourse('versiones-qa');
  assert.equal(live?.title, 'Versión dos');
  assert.deepEqual(live?.lessons.map((lesson) => lesson.slug), ['primera', 'segunda']);
  assert.equal(live?.lessons[0].id, 'versiones-first');
  assert.match(live?.lessons[1].id ?? '', /^[a-f0-9]{32}$/);
  assert.equal(live?.lessons[0].preview_public, true);
  assert.equal((await sql`SELECT id FROM lms_progress WHERE id = 'versiones-done' AND lesson_id = 'versiones-first'`).length, 1);
  assert.equal((await sql`SELECT id FROM lms_courses WHERE id = ${draftId}`).length, 0);
  const staleId = await createCourseRevision('versiones-curso', 'versiones-teacher');
  const { requireCourseEditor } = await import('@/lib/crm/course-access');
  await sql`UPDATE lms_courses SET teacher_id = 'versiones-otro' WHERE id = 'versiones-curso'`;
  signIn('profesor', teacher);
  assert.equal(await redirected(() => requireCourseEditor(staleId)), '/dashboard/profesor');
  assert.equal(await createCourseRevision('versiones-curso', 'versiones-otro'), '');
  await sql`UPDATE lms_courses SET teacher_id = 'versiones-teacher' WHERE id = 'versiones-curso'`;
  await sql`UPDATE lms_courses SET review_requested_at = now() WHERE id = ${staleId}`;
  await sql`UPDATE lms_courses SET authoring_version = authoring_version + 1 WHERE id = 'versiones-curso'`;
  assert.equal(await publishCourseRevision(staleId, 'versiones-curso', 0), false);
  console.log('OK Borrador paralelo, aprobación, nuevas clases y conservación del progreso');

  assert.equal((await request()).status, 404);
  signInStudent('versiones-b');
  assert.equal((await request()).status, 404);
  const review = form({ slug: 'versiones-qa', rating: '5', body: 'Curso verificable' });
  assert.match(await redirected(() => saveCourseReview(review)), /resena=acceso/);
  signInStudent('versiones-a');
  const file = await request();
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('content-disposition'), 'attachment; filename="plantilla-privada.txt"');
  assert.equal(await file.text(), 'FICHA PRIVADA');
  assert.match(await redirected(() => saveCourseReview(review)), /resena=ok/);
  assert.equal((await getCourseReviews('versiones-curso', '')).count, 0);
  const [pending] = await listReviewsForModeration('versiones-curso');
  const moderation = form({ course_id: 'versiones-curso', person_id: 'versiones-a', status: 'publicada', version: pending.version });
  signIn('profesor', teacher);
  assert.equal(await redirected(() => moderateCourseReview(moderation)), '/dashboard/profesor');
  signIn('superadmin', PRIMARY_ADMIN);
  assert.match(await redirected(() => moderateCourseReview(moderation)), /resultado=resena/);
  assert.equal((await getCourseReviews('versiones-curso', '')).average, 5);
  assert.match(await redirected(() => postLessonQuestion(form({ lesson_id: 'versiones-first', question: '¿Cómo mido las reservas?' }))), /pregunta=ok/);
  assert.equal((await getLessonQuestions('versiones-first', 'versiones-b')).length, 0);
  const [question] = await getLessonQuestions('versiones-first', 'versiones-a');
  const reply = form({ course_id: 'versiones-curso', question_id: question.id, answer: 'Registra las reservas confirmadas.' });
  signIn('profesor', otherTeacher);
  assert.equal(await redirected(() => answerLessonQuestion(reply)), '/dashboard/profesor');
  signIn('profesor', teacher);
  assert.match(await redirected(() => answerLessonQuestion(reply)), /filtro=respondidas/);
  assert.equal((await getLessonQuestions('versiones-first', 'versiones-a'))[0].answer, 'Registra las reservas confirmadas.');
  console.log('OK Descarga privada, reseñas verificadas y preguntas visibles solo para sus participantes');

  await sql`INSERT INTO academia_events(id,name,person_id,data,created_at) VALUES
    ('versiones-start-a','lesson_started','versiones-a',${JSON.stringify({ lesson: 'versiones-first' })},now()-interval '9 days'),
    ('versiones-start-b','lesson_started','versiones-b',${JSON.stringify({ lesson: 'versiones-first' })},now()-interval '8 days'),
    ('versiones-quiz-a','mission_submitted','versiones-a',${JSON.stringify({ lesson: 'versiones-first', kind: 'quiz', total: 2, correct: 2 })},now()),
    ('versiones-quiz-b','mission_submitted','versiones-a',${JSON.stringify({ lesson: 'versiones-first', kind: 'quiz', total: 2, correct: 0 })},now())`;
  const [first] = await courseLessonReports('versiones-curso');
  assert.deepEqual([first.started, first.finished, first.stalled, first.attempts, first.participants, first.passed, first.average], [2, 1, 1, 2, 1, 1, 50]);
  assert.match(progressCsv(await courseStudentProgress('versiones-curso')), /"'=Fórmula QA".*"1","2","50"/);
  const attempts = await courseQuizAttempts('versiones-curso', 'versiones-a', 0);
  assert.deepEqual(attempts.map(({ student, correct, total }) => [student, correct, total]), [['=Fórmula QA', 0, 2], ['=Fórmula QA', 2, 2]]);
  assert.equal((await courseQuizAttempts('versiones-curso', 'versiones-b', 0)).length, 0);
  assert.equal((await courseQuizAttempts('curso-ajeno', 'versiones-a', 0)).length, 0);
  console.log('OK Abandono, intentos por alumno e integridad del CSV');

  const courseId = 'versiones-curso';
  const personId = 'versiones-a';
  const sendAccess = (action: 'pause' | 'resume', target = personId) => requestCourseAccessChange(form({
    course_id: courseId, person_id: target, action, reason: 'Motivo de prueba',
  }));
  const resolveAccess = (requestId: string, decision = 'approved') => resolveCourseAccessChange(form({
    course_id: courseId, person_id: personId, request_id: requestId, decision,
  }));
  const currentRequest = async () => (await courseAccessRequests(courseId))[0].request_id;
  signIn('profesor', otherTeacher);
  assert.equal(await redirected(() => sendAccess('pause')), '/dashboard/profesor');
  signIn('profesor', teacher);
  assert.match(await redirected(() => sendAccess('pause', 'versiones-b')), /error=estado-acceso/);
  assert.match(await redirected(() => sendAccess('resume')), /error=estado-acceso/);
  assert.match(await redirected(() => sendAccess('pause')), /guardado=solicitud-acceso/);
  const pause = await currentRequest();
  assert.match(await redirected(() => sendAccess('pause')), /error=estado-acceso/);
  assert.equal(await redirected(() => resolveAccess(pause)), '/dashboard/profesor');
  assert.equal((await request()).status, 200);
  signIn('superadmin', PRIMARY_ADMIN);
  assert.match(await redirected(() => resolveAccess(pause)), /guardado=solicitud-resuelta/);
  assert.equal((await request()).status, 404);
  assert.equal(await ownsCourse(personId, courseId), true);
  assert.equal((await myCourses(personId)).find((course) => course.slug === 'versiones-qa')?.availability, 'Acceso al curso pausado');
  assert.equal(await canReadCourse(personId, { id: courseId, price_cents: 0, teacher_id: 'versiones-teacher' }), false);
  assert.equal(await canReadCourse('', { id: courseId, price_cents: 0, teacher_id: 'versiones-teacher' }), true);
  signIn('profesor', teacher);
  assert.match(await redirected(() => sendAccess('resume')), /guardado=solicitud-acceso/);
  const rejectedResume = await currentRequest();
  assert.notEqual(rejectedResume, pause);
  signIn('superadmin', PRIMARY_ADMIN);
  assert.match(await redirected(() => resolveAccess(pause)), /error=estado-acceso/);
  assert.match(await redirected(() => resolveAccess(rejectedResume, 'rejected')), /guardado=solicitud-resuelta/);
  assert.equal((await request()).status, 404);
  signIn('profesor', teacher);
  assert.match(await redirected(() => sendAccess('resume')), /guardado=solicitud-acceso/);
  signIn('superadmin', PRIMARY_ADMIN);
  assert.match(await redirected(async () => resolveAccess(await currentRequest())), /guardado=solicitud-resuelta/);
  assert.equal((await request()).status, 200);
  assert.equal((await sql`SELECT id FROM lms_progress WHERE id = 'versiones-done'`).length, 1);
  console.log('OK Solicitudes de acceso con aprobación, permisos, rechazo, descarga y conservación de la matrícula');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
