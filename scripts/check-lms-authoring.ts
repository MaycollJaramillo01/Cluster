import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function redirected(action: () => Promise<void>) {
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
  let cookie = '';
  let learnerCookie = '';
  const { ACADEMIA_COOKIE, academiaCookieValue } = await import('@/lib/valux/session');
  require('next/headers').cookies = async () => ({
    get: (key: string) => {
      const value = key === ACADEMIA_COOKIE ? learnerCookie : cookie;
      return value ? { value } : undefined;
    },
  });
  require('next/cache').revalidatePath = () => {};
  const { issueSession, PRIMARY_ADMIN } = await import('@/lib/crm/session');
  const {
    createCourse, createLesson, createResource, createSection, deleteResource,
    moveCourseLesson, moveCourseSection, renameCourseSection, requestReview, returnCourseReview,
    setCoursePublication, updateCoursePresentation, updateLesson, saveLessonScore,
  } = await import('@/lib/crm/lms-actions');
  const { getCourse, getLesson } = await import('@/lib/crm/lms');
  const { publishedCourse } = await import('@/lib/valux/data');
  const { submitMission } = await import('@/lib/valux/actions');
  const { reviewAssignment, submitAssignment } = await import('@/lib/valux/assignment-actions');
  const { getAssignmentSubmission } = await import('@/lib/valux/assignments');
  const { gradeMission, parseMission, publicMission } = await import('@/lib/valux/mission');
  const tag = randomUUID().slice(0, 8);
  const teacher = `author-${tag}@example.test`;
  const outsider = `outsider-${tag}@example.test`;
  const editor = `editor-${tag}@example.test`;
  const learnerId = `learner-${tag}`;
  const createdIds: string[] = [];

  async function newCourse(title: string) {
    const path = await redirected(() => createCourse(form({
      title, description: 'Practicar una habilidad', published: 'on', price: '499', teacher_id: 'ajeno',
    })));
    assert.match(path, /^\/dashboard\/cursos\/[\w-]+$/);
    const id = path.split('/').pop()!;
    createdIds.push(id);
    return id;
  }

  async function newLesson(courseId: string, sectionId: string, title: string) {
    const path = await redirected(() => createLesson(form({ course_id: courseId, section_id: sectionId, title, editor: '1' })));
    assert.ok(path.startsWith(`/dashboard/cursos/${courseId}/lecciones/`));
    return path.split('/').pop()!;
  }

  await sql`
    INSERT INTO crm_staff (email, name, role) VALUES
      (${teacher}, 'Maestro QA', 'profesor'), (${outsider}, 'Otro maestro QA', 'profesor'), (${editor}, 'Contenido QA', 'contenido')
  `;
  try {
    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    const courseId = await newCourse(`Taller docente ${tag}`);
    const draft = await getCourse(courseId);
    assert.ok(draft);
    const [owner] = await sql`SELECT email, role FROM valux_people WHERE id = ${draft.course.teacher_id}`;
    assert.deepEqual(owner, { email: teacher, role: 'profesor' });
    assert.equal(draft.course.published, false);
    assert.equal(draft.course.price_cents, 0);
    assert.equal(await publishedCourse(draft.course.slug), null);
    const path = `/dashboard/cursos/${courseId}`;
    const reviewError = `${path}?vista=revision&error=revision#revision`;
    assert.equal(await redirected(() => requestReview(form({ course_id: courseId }))), reviewError);

    const cover = 'https://example.test/cover.png';
    assert.equal(await redirected(() => updateCoursePresentation(form({
      course_id: courseId, title: 'Ficha editada', description: 'Objetivos y metodología', cover_url: cover,
      learning_outcomes: 'Interpretar reportes', audience: 'Equipos de marketing', prerequisites: 'Ninguno',
      published: 'on', price: '999',
    }))), `${path}?guardado=ficha#ficha`);
    const presented = await getCourse(courseId);
    assert.ok(presented);
    assert.equal(presented.course.title, 'Ficha editada');
    assert.equal(presented.course.description, 'Objetivos y metodología');
    assert.equal(presented.course.cover_url, cover);
    assert.equal(presented.course.slug, draft.course.slug);
    assert.equal(presented.course.learning_outcomes, 'Interpretar reportes');
    assert.equal(presented.course.audience, 'Equipos de marketing');
    assert.equal(presented.course.prerequisites, 'Ninguno');
    assert.equal(presented.course.published, false);
    assert.equal(presented.course.price_cents, 0);

    cookie = issueSession(outsider, 'Otro maestro QA', 'profesor');
    const otherCourseId = await newCourse(`Curso ajeno ${tag}`);
    await createSection(form({ course_id: otherCourseId, title: 'Módulo ajeno' }));
    const otherSection = (await getCourse(otherCourseId))!.sections[0].id;
    assert.equal(await redirected(() => createSection(form({ course_id: courseId, title: 'Intrusión' }))), '/dashboard/profesor');
    assert.equal(await redirected(() => updateCoursePresentation(form({ course_id: courseId, title: 'Intrusión', description: 'Intrusión' }))), '/dashboard/profesor');
    assert.equal(await redirected(() => requestReview(form({ course_id: courseId }))), '/dashboard/profesor');

    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    await createSection(form({ course_id: courseId, title: 'Fundamentos' }));
    await createSection(form({ course_id: courseId, title: 'Práctica' }));
    const sections = (await getCourse(courseId))!.sections;
    assert.deepEqual(sections.map(({ title, sort_order }) => ({ title, sort_order })), [
      { title: 'Fundamentos', sort_order: 1 }, { title: 'Práctica', sort_order: 2 },
    ]);
    await renameCourseSection(form({ course_id: courseId, id: sections[1].id, title: 'Práctica aplicada' }));
    await moveCourseSection(form({ course_id: courseId, id: sections[1].id, direction: 'up' }));
    assert.deepEqual((await getCourse(courseId))?.sections.map(({ id, title }) => ({ id, title })), [
      { id: sections[1].id, title: 'Práctica aplicada' }, { id: sections[0].id, title: 'Fundamentos' },
    ]);
    await moveCourseSection(form({ course_id: courseId, id: sections[1].id, direction: 'down' }));
    assert.match(await redirected(() => createLesson(form({
      course_id: courseId, section_id: otherSection, title: 'Módulo cruzado', editor: '1',
    }))), /[?&]error=seccion(?:[&#]|$)/);
    assert.equal((await getCourse(courseId))?.lessons.length, 0);
    const firstLessonId = await newLesson(courseId, sections[0].id, 'Comprueba tus conceptos');
    const secondLessonId = await newLesson(courseId, sections[0].id, 'Practica la técnica');
    await moveCourseLesson(form({ course_id: courseId, id: secondLessonId, direction: 'up' }));
    assert.deepEqual((await getCourse(courseId))?.lessons.map(({ id }) => id), [secondLessonId, firstLessonId]);
    await moveCourseLesson(form({ course_id: courseId, id: secondLessonId, direction: 'down' }));
    assert.equal(await redirected(() => requestReview(form({ course_id: courseId }))), reviewError);

    const firstLessonPath = `${path}/lecciones/${firstLessonId}`;
    const secondLessonPath = `${path}/lecciones/${secondLessonId}`;
    const quiz = '¿Qué mide el CTR?\n- Ventas\n* Clics sobre impresiones';
    const checklist = '[ ] Publiqué el anuncio\n[ ] Revisé el resultado';
    const saveQuiz = (mission: string) => updateLesson(form({
      id: firstLessonId, course_id: courseId, section_id: sections[0].id, title: 'Comprueba tus conceptos',
      content: 'Define CTR y CPC.', video_url: 'https://youtu.be/iqTSX9cZ380', duration_min: '6', points: '15', mission, editor: '1',
    }));
    assert.equal(await redirected(() => saveQuiz(quiz)), `${firstLessonPath}?guardado=1`);
    assert.match(await redirected(() => updateLesson(form({
      id: secondLessonId, course_id: courseId, section_id: otherSection, title: 'Módulo cruzado', editor: '1',
    }))), /[?&]error=seccion(?:[&#]|$)/);
    assert.equal((await getLesson(courseId, secondLessonId))?.section_id, sections[0].id);
    assert.equal(await redirected(() => updateLesson(form({
      id: secondLessonId, course_id: courseId, section_id: sections[1].id, title: 'Practica la técnica',
      content: 'Completa y revisa los dos pasos.', mission: checklist, editor: '1',
    }))), `${secondLessonPath}?guardado=1`);
    // Las lecciones antiguas podían almacenar el texto de una misión con errores.
    await sql`UPDATE lms_lessons SET mission = 'Pregunta sin opciones' WHERE id = ${firstLessonId}`;
    assert.equal(await redirected(() => requestReview(form({ course_id: courseId }))), reviewError, 'Un curso con misión antigua inválida no entra a revisión');
    assert.equal(await redirected(() => saveQuiz(quiz)), `${firstLessonPath}?guardado=1`);
    const syllabus = await getCourse(courseId);
    assert.ok(syllabus);
    assert.deepEqual(syllabus.lessons.map(({ id, section_id, sort_order, mission }) => ({ id, section_id, sort_order, mission })), [
      { id: firstLessonId, section_id: sections[0].id, sort_order: 1, mission: quiz },
      { id: secondLessonId, section_id: sections[1].id, sort_order: 1, mission: checklist },
    ]);
    const first = await getLesson(courseId, firstLessonId);
    assert.ok(first);
    assert.equal(first.video_url, 'https://youtu.be/iqTSX9cZ380');
    assert.equal(first.duration_min, 6);
    assert.equal(first.points, 15);
    const parsedQuiz = parseMission(first.mission).mission;
    const parsedChecklist = parseMission(syllabus.lessons[1].mission).mission;
    assert.equal(parsedQuiz?.kind, 'quiz');
    assert.equal(parsedChecklist?.kind, 'checklist');
    assert.equal(gradeMission(parsedQuiz, () => '1').passed, true);
    assert.equal(gradeMission(parsedChecklist, (key) => key === 'item0' ? '1' : '').passed, false);
    assert.equal(gradeMission(parsedChecklist, () => '1').passed, true);
    assert.deepEqual(publicMission(parsedQuiz), { kind: 'quiz', questions: [{ prompt: '¿Qué mide el CTR?', options: ['Ventas', 'Clics sobre impresiones'] }] });

    assert.equal(await redirected(() => createResource(form({ lesson_id: firstLessonId, title: 'Material vacío' }))), `${firstLessonPath}?error=recurso#materiales`);
    const material = 'https://example.test/guia.pdf';
    assert.equal(await redirected(() => createResource(form({
      lesson_id: firstLessonId, title: 'Guía de práctica', url: material,
    }))), `${firstLessonPath}?guardado=recurso#materiales`);
    const [resource] = (await getLesson(courseId, firstLessonId))!.resources;
    assert.equal(resource.title, 'Guía de práctica');
    assert.equal(resource.url, material);
    assert.equal(resource.kind, 'pdf', 'El tipo del material sale de su enlace');

    const assignmentId = await newLesson(courseId, sections[1].id, 'Entrega tu plan');
    const assignmentPath = `${path}/lecciones/${assignmentId}`;
    const assignment = '[tarea]\r\nDescribe tu práctica y cómo medirás el resultado.';
    assert.equal(await redirected(() => updateLesson(form({ id: assignmentId, course_id: courseId,
      section_id: sections[1].id, title: 'Entrega tu plan', mission: assignment, points: '17', editor: '1' }))), `${assignmentPath}?guardado=1`);

    cookie = issueSession(outsider, 'Otro maestro QA', 'profesor');
    assert.equal(await redirected(() => createLesson(form({ course_id: courseId, title: 'Ajena' }))), '/dashboard/profesor');
    assert.equal(await redirected(() => updateLesson(form({
      id: firstLessonId, course_id: courseId, title: 'Ajena', content: 'Texto ajeno',
    }))), '/dashboard/profesor');
    assert.equal(await redirected(() => createResource(form({
      lesson_id: firstLessonId, kind: 'texto', title: 'Ajeno', content: 'Texto ajeno',
    }))), '/dashboard/profesor');
    assert.equal(await redirected(() => deleteResource(form({ id: resource.id }))), '/dashboard/profesor');

    const approve = () => setCoursePublication(form({ id: courseId, publication: 'publish' }));
    const returnForChanges = () => returnCourseReview(form({ id: courseId, feedback: 'Precisa los resultados de aprendizaje.' }));
    cookie = issueSession(PRIMARY_ADMIN, 'Superadmin QA', 'superadmin');
    assert.match(await redirected(approve), /[?&]error=/);
    assert.equal(await publishedCourse(draft.course.slug), null);

    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    await requestReview(form({ course_id: courseId }));
    assert.ok((await getCourse(courseId))?.course.review_requested_at);
    assert.equal(await redirected(approve), '/dashboard/profesor');
    assert.equal(await redirected(returnForChanges), '/dashboard/profesor');
    assert.match(await redirected(() => createSection(form({ course_id: courseId, title: 'Cambio sin revisión' }))), new RegExp(`^${path}(?:[?#]|$)`));
    assert.equal((await getCourse(courseId))?.sections.length, 2);
    cookie = issueSession(editor, 'Contenido QA', 'contenido');
    assert.equal(await redirected(approve), '/dashboard/cursos');
    assert.equal(await publishedCourse(draft.course.slug), null);

    cookie = issueSession(PRIMARY_ADMIN, 'Superadmin QA', 'superadmin');
    await returnForChanges();
    const [returned] = await sql`SELECT review_requested_at, review_feedback, published FROM lms_courses WHERE id = ${courseId}`;
    assert.deepEqual(returned, { review_requested_at: null, review_feedback: 'Precisa los resultados de aprendizaje.', published: false });
    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    await renameCourseSection(form({ course_id: courseId, id: sections[0].id, title: 'Fundamentos de medición' }));
    await requestReview(form({ course_id: courseId }));
    cookie = issueSession(PRIMARY_ADMIN, 'Superadmin QA', 'superadmin');
    await approve();
    await approve();
    const published = await publishedCourse(draft.course.slug);
    assert.equal(published?.id, courseId);
    assert.equal((await getCourse(courseId))?.course.review_requested_at, null);
    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    assert.match(await redirected(() => createSection(form({ course_id: courseId, title: 'Cambio luego de publicar' }))), new RegExp(`^${path}(?:[?#]|$)`));
    assert.equal((await getCourse(courseId))?.sections.length, 2);

    await sql`INSERT INTO valux_people (id, name, email) VALUES (${learnerId}, 'Estudiante QA', ${`${learnerId}@example.test`})`;
    cookie = '';
    learnerCookie = academiaCookieValue(learnerId);
    const learnerCoursePath = `/academia/${draft.course.slug}`;
    const quizUrl = `${learnerCoursePath}/comprueba-tus-conceptos`;
    const checklistUrl = `${learnerCoursePath}/practica-la-tecnica`;
    const assignmentUrl = `${learnerCoursePath}/entrega-tu-plan`;
    const turnIn = (attempt: string, response: string) => submitAssignment(form({ lesson_id: assignmentId, attempt, response }));
    assert.equal(await redirected(() => turnIn('0', 'No puedo saltar el temario.')), assignmentUrl);
    assert.equal(await getAssignmentSubmission(assignmentId, learnerId), null);
    assert.equal(await redirected(() => submitMission(form({ lesson_id: secondLessonId, item0: '1', item1: '1' }))), checklistUrl);
    assert.match(await redirected(() => submitMission(form({ lesson_id: firstLessonId, q0: '0' }))), /mision=0-1/);
    assert.equal(await redirected(() => submitMission(form({ lesson_id: firstLessonId, q0: '1' }))), `${quizUrl}?mision=ok#mision`);
    assert.match(await redirected(() => submitMission(form({ lesson_id: secondLessonId, item0: '1' }))), /mision=1-2/);
    assert.equal(await redirected(() => submitMission(form({ lesson_id: secondLessonId, item0: '1', item1: '1' }))), `${checklistUrl}?mision=ok#mision`);
    assert.equal(await redirected(() => turnIn('0', 'Mi plan de práctica inicial.')), `${assignmentUrl}#mision`);
    assert.equal((await getAssignmentSubmission(assignmentId, learnerId))?.status, 'pendiente');
    await redirected(() => turnIn('0', 'Una pestaña anterior intenta sobrescribir la entrega.'));
    assert.equal((await getAssignmentSubmission(assignmentId, learnerId))?.response, 'Mi plan de práctica inicial.');
    const review = (decision: string, attempt: string, feedback = '') => reviewAssignment(form({ course_id: courseId, lesson_id: assignmentId,
      person_id: learnerId, attempt, decision, feedback }));
    cookie = issueSession(outsider, 'Otro maestro QA', 'profesor');
    assert.equal(await redirected(() => review('approve', '1')), '/dashboard/profesor');
    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    await saveLessonScore(form({ lesson_id: assignmentId, person_id: learnerId, score: '100' }));
    assert.equal((await sql`SELECT id FROM lms_progress WHERE lesson_id = ${assignmentId}`).length, 0);
    assert.match(await redirected(() => review('changes', '1')), /error=feedback/);
    assert.match(await redirected(() => review('changes', '1', 'Añade una métrica.')), /guardado=1/);
    assert.equal((await getAssignmentSubmission(assignmentId, learnerId))?.status, 'cambios');
    cookie = '';
    assert.equal(await redirected(() => turnIn('1', 'Voy a medir el CTR cada semana.')), `${assignmentUrl}#mision`);
    assert.equal((await getAssignmentSubmission(assignmentId, learnerId))?.attempt, 2);
    cookie = issueSession(teacher, 'Maestro QA', 'profesor');
    assert.match(await redirected(() => review('approve', '1')), /error=estado/);
    assert.match(await redirected(() => review('approve', '2', 'Aprobada.')), /guardado=1/);
    assert.match(await redirected(() => review('approve', '2')), /error=estado/);
    assert.equal((await getAssignmentSubmission(assignmentId, learnerId))?.status, 'aprobada');
    assert.deepEqual(await sql`SELECT xp FROM lms_xp WHERE person_id = ${learnerId} AND lesson_id = ${assignmentId}`, [{ xp: 17 }]);
    const completed = await sql`SELECT lesson_id FROM lms_progress WHERE person_id = ${learnerId} AND completed_at IS NOT NULL`;
    assert.deepEqual(new Set(completed.map(({ lesson_id }) => lesson_id)), new Set([firstLessonId, secondLessonId, assignmentId]));
    console.log('OK   profesor propietario, ficha, módulos, lecciones, tareas, misiones, materiales y publicación por superadmin');
  } finally {
    await sql`DELETE FROM lms_courses WHERE id = ANY(${createdIds})`;
    await sql`DELETE FROM academia_events WHERE person_id = ${learnerId}`;
    await sql`DELETE FROM valux_people WHERE id = ${learnerId} OR email = ANY(${[teacher, outsider]})`;
    await sql`DELETE FROM crm_staff WHERE email = ANY(${[teacher, outsider, editor]})`;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
