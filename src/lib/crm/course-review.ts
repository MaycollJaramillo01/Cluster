import { parseMission } from '@/lib/valux/mission';
import { bunnyVideo, validLessonVideo } from '@/lib/valux/video';
import type { getCourse } from './lms';

export function courseReviewIssues(detail: NonNullable<Awaited<ReturnType<typeof getCourse>>>) {
  const issues: string[] = [];
  if (!detail.course.title.trim() || !detail.course.description.trim()) issues.push('Completa el título y la descripción de la ficha.');
  if (!detail.lessons.length) issues.push('Añade al menos una clase.');
  for (const lesson of detail.lessons) {
    const parsed = parseMission(lesson.mission);
    const validVideo = Boolean(lesson.video_url && validLessonVideo(lesson.video_url));
    if (lesson.video_url && !validVideo) issues.push(`Revisa el enlace de video en «${lesson.title}».`);
    if (lesson.video_url && bunnyVideo(lesson.video_url)?.library === '') {
      issues.push(`Completa la URL de Bunny o configura la biblioteca para «${lesson.title}».`);
    }
    if (parsed.errors.length) issues.push(`Corrige la actividad en «${lesson.title}».`);
    if (!lesson.content.trim() && !validVideo && !parsed.mission && !lesson.resources_count && !parsed.errors.length && !lesson.video_url) {
      issues.push(`Añade contenido a «${lesson.title}».`);
    }
  }
  return issues;
}
