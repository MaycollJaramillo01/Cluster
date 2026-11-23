import { crm } from '@/lib/crm/db';

export type LessonNote = { body: string; version: string };
export type NoteFeedback = { status: 'idle' | 'saved' | 'removed' | 'error'; message: string; version: string };

export async function getLessonNote(personId: string, lessonId: string) {
  const sql = await crm();
  const [row] = await sql`SELECT body, version FROM lms_lesson_notes WHERE person_id = ${personId} AND lesson_id = ${lessonId}`;
  return (row as LessonNote | undefined) ?? null;
}
