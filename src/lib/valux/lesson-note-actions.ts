'use server';

import { crm } from '@/lib/crm/db';
import { lessonContext } from './lesson-progress';
import { academiaPersonId } from './session';
import type { NoteFeedback } from './lesson-notes';

export async function saveLessonNote(previous: NoteFeedback, form: FormData): Promise<NoteFeedback> {
  const personId = await academiaPersonId();
  const lessonId = String(form.get('lesson_id') || '');
  const body = String(form.get('body') || '').trim();
  const version = String(form.get('version') || '');
  const fail = (message: string): NoteFeedback => ({ status: 'error', message, version: previous.version });
  if (!personId || !lessonId) return fail('Entra en tu cuenta para guardar la nota.');
  if (body.length > 6000) return fail('La nota puede tener hasta 6000 caracteres.');
  const lesson = await lessonContext(lessonId, personId);
  if (!lesson?.allowed || !lesson.active) return fail('Necesitas acceso a esta clase para guardar una nota.');
  const sql = await crm();
  if (!body) {
    if (!version) return { status: 'idle', message: '', version: '' };
    const removed = await sql`DELETE FROM lms_lesson_notes WHERE lesson_id = ${lessonId} AND person_id = ${personId} AND version = ${version} RETURNING version`;
    if (removed.length) return { status: 'removed', message: 'Nota eliminada.', version: '' };
  } else {
    const next = crypto.randomUUID();
    const saved = version
      ? await sql`UPDATE lms_lesson_notes SET body = ${body}, version = ${next}
          WHERE person_id = ${personId} AND lesson_id = ${lessonId} AND version = ${version} RETURNING version`
      : await sql`INSERT INTO lms_lesson_notes (lesson_id, person_id, body, version)
          VALUES (${lessonId}, ${personId}, ${body}, ${next}) ON CONFLICT (person_id, lesson_id) DO NOTHING RETURNING version`;
    if (saved.length) return { status: 'saved', message: 'Nota guardada.', version: next };
  }
  return fail('La nota cambió en otra sesión. Copia tu texto y recarga la clase antes de editarla de nuevo.');
}
