import assert from 'node:assert/strict';
import type { NoteFeedback } from '@/lib/valux/lesson-notes';

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Usa npm run test:lms para aislar los datos');
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const sql = await crm();
  let signed = '';
  const { academiaCookieValue, ACADEMIA_COOKIE } = await import('@/lib/valux/session');
  require('next/headers').cookies = async () => ({ get: (name: string) => name === ACADEMIA_COOKIE && signed ? { value: signed } : undefined });
  const { myCourses, lessonAccess, publishedCourse } = await import('@/lib/valux/data');
  const { getLessonNote } = await import('@/lib/valux/lesson-notes');
  const { saveLessonNote } = await import('@/lib/valux/lesson-note-actions');
  const { trackEvent } = await import('@/lib/valux/events');
  const empty: NoteFeedback = { status: 'idle', message: '', version: '' };
  const write = (lesson: string, body: string, previous = empty) => {
    const data = new FormData();
    data.set('lesson_id', lesson);
    data.set('body', body);
    data.set('version', previous.version);
    return saveLessonNote(previous, data);
  };

  await sql`INSERT INTO valux_people(id,name,email) VALUES ('stu-a','Alumno A','phase3-a@example.test'),('stu-b','Alumno B','phase3-b@example.test')`;
  await sql`INSERT INTO lms_courses(id,slug,title,price_cents,published) VALUES ('stu-course','stu-course','Curso alumno',10000,true)`;
  await sql`INSERT INTO lms_enrollments(id,person_id,course_id) VALUES ('stu-enrolled','stu-a','stu-course')`;
  await sql`INSERT INTO lms_sections(id,course_id,title,sort_order) VALUES ('stu-module','stu-course','Módulo',2)`;
  await sql`INSERT INTO lms_lessons(id,course_id,slug,title,section_id,sort_order) VALUES
    ('stu-first','stu-course','primera','Primera','stu-module',1),
    ('stu-next','stu-course','siguiente','Siguiente','stu-module',2),
    ('stu-loose','stu-course','suelta','Suelta',NULL,0)`;
  const library = async () => (await myCourses('stu-a')).find((item) => item.slug === 'stu-course');
  assert.equal((await library())?.nextLesson?.slug, 'primera');
  assert.equal((await library())?.started, false);
  await trackEvent('lesson_started', { id: 'lesson_started:stu-a:stu-first', personId: 'stu-a' });
  assert.equal((await library())?.started, true);
  await sql`INSERT INTO lms_progress(id,person_id,lesson_id,completed_at) VALUES
    ('stu-complete-first','stu-a','stu-first',now()),('stu-complete-loose','stu-a','stu-loose',now())`;
  assert.equal((await library())?.nextLesson?.slug, 'siguiente');
  assert.equal((await library())?.done, 2);
  const published = await publishedCourse('stu-course');
  assert.ok(published);
  const access = await lessonAccess('stu-a', published);
  assert.equal(access.pending?.id, 'stu-next');
  assert.ok(access.unlocked.has('stu-loose'), 'Una clase completada sigue disponible tras reordenar el curso');
  await sql`INSERT INTO lms_progress(id,person_id,lesson_id,completed_at) VALUES ('stu-complete-next','stu-a','stu-next',now())`;
  assert.equal((await library())?.nextLesson, null);
  assert.equal((await library())?.done, 3);
  await sql`DELETE FROM lms_progress WHERE id IN ('stu-complete-first','stu-complete-next')`;
  console.log('OK La biblioteca coincide con el orden del aula y conserva el acceso a clases completadas');

  assert.equal((await write('stu-first', 'anónimo')).status, 'error');
  signed = academiaCookieValue('stu-a');
  assert.equal((await write('stu-next', 'cerrada')).status, 'error');
  assert.equal((await write('stu-first', 'x'.repeat(6001))).status, 'error');
  const initial = await write('stu-first', 'Primera nota');
  assert.equal(initial.status, 'saved');
  const [one, two] = await Promise.all([write('stu-first', 'Cambio uno', initial), write('stu-first', 'Cambio dos', initial)]);
  const current = one.status === 'saved' ? one : two;
  assert.deepEqual([one.status, two.status].sort(), ['error', 'saved']);
  signed = academiaCookieValue('stu-b');
  assert.equal((await write('stu-first', 'intento ajeno', current)).status, 'error');
  assert.equal(await getLessonNote('stu-b', 'stu-first'), null);
  signed = academiaCookieValue('stu-a');
  await sql`UPDATE valux_people SET is_active=false WHERE id='stu-a'`;
  assert.equal((await write('stu-first', 'suspendida', current)).status, 'error');
  await sql`UPDATE valux_people SET is_active=true WHERE id='stu-a'`;
  await sql`UPDATE lms_courses SET published=false WHERE id='stu-course'`;
  assert.equal((await write('stu-first', 'archivada', current)).status, 'error');
  await sql`UPDATE lms_courses SET published=true WHERE id='stu-course'`;
  assert.equal((await write('stu-first', '', current)).status, 'removed');
  assert.equal(await getLessonNote('stu-a', 'stu-first'), null);
  console.log('OK Notas privadas, acceso vigente, edición concurrente y borrado');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
